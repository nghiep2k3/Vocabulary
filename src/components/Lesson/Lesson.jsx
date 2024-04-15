import React, { useEffect, useState } from 'react';
import styles from './Lesson.module.css';
import { Link } from 'react-router-dom';
import { Button, Modal, Input, message } from 'antd';
import { ref, get, child, set, remove } from 'firebase/database';
import { database } from '../../firebase';
import Header from '../Header/Header';
import { CloseOutlined, DatabaseOutlined } from '@ant-design/icons';

export default function Lesson() {
    const dbRef = ref(database);
    const [data, setData] = useState({});
    const [dataModal, setDataModal] = useState([]);
    const [open, setOpen] = useState(false);
    const [openWord, setOpenWord] = useState(false);
    const [word, setWord] = useState('');
    const [translate, setTranslate] = useState('');
    const [selectedItem, setSelectedItem] = useState('');
    const [load, setLoad] = useState(false);
    const [vocabularyLengths, setVocabularyLengths] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);
    const [idToDelete, setIdToDelete] = useState(null);

    useEffect(() => {
        const fetchVocabularyLengths = async () => {
            const snapshot = await get(dbRef);

            if (snapshot.exists()) {
                const dataValue = snapshot.val();
                setData(dataValue);
                setLoad(true);

                const lengths = {};

                for (const key of Object.keys(dataValue)) {
                    const vocabularyRef = child(ref(database), `${key}/Vocabulary`);

                    try {
                        const vocabSnapshot = await get(vocabularyRef);

                        if (vocabSnapshot.exists()) {
                            lengths[key] = Object.keys(vocabSnapshot.val()).length;
                        } else {
                            lengths[key] = 0;
                        }
                    } catch (error) {
                        console.error(`Lỗi khi lấy độ dài của từ vựng cho ${key}:`, error);
                        lengths[key] = 0;
                    }
                }

                setVocabularyLengths(lengths);
            }
        };

        fetchVocabularyLengths();
    }, []);

    const showModal = (item) => {
        setSelectedItem(item);
        setOpen(true);
    };

    const hideModal = () => {
        setOpen(false);
        window.location.reload(); // Tải lại trang sau khi đóng modal
    };

    const showModalWord = async (item) => {
        setSelectedItem(item);
        const vocabularyRef = child(dbRef, `${item}/Vocabulary`);

        try {
            const vocabSnapshot = await get(vocabularyRef);

            if (vocabSnapshot.exists()) {
                const vocabData = vocabSnapshot.val();
                setDataModal(Object.values(vocabData));
                setOpenWord(true);
            }
        } catch (error) {
            console.error(`Lỗi khi lấy danh sách từ vựng cho ${item}:`, error);
        }
    };

    const hideModalWord = () => {
        setOpenWord(false);
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleDelete = (id) => {
        setIdToDelete(id);
        setShowConfirm(true);
    };

    const confirmDelete = async () => {
        try {
            const itemPath = `${selectedItem}/Vocabulary/c${idToDelete}`;
            console.log(itemPath);
            await remove(child(dbRef, itemPath));
            
            const updatedData = dataModal.filter((item) => item.id !== idToDelete);
            setDataModal(updatedData);
            
            console.log(`Đã xóa từ vựng với id ${idToDelete}`);
        } catch (error) {
            console.error("Lỗi khi xóa từ vựng:", error);
        } finally {
            setShowConfirm(false);
            setIdToDelete(null);
        }
    };
    

    const cancelDelete = () => {
        setShowConfirm(false);
        setIdToDelete(null);
    };

    const handleAddWord = async () => {
        if (word === '' || translate === '') {
            message.error('Vui lòng nhập từ và nghĩa của từ!', 1.5);
            return;
        }

        const vocabularyRef = child(dbRef, `${selectedItem}/Vocabulary`);

        try {
            const vocabSnapshot = await get(vocabularyRef);
            const length = vocabSnapshot.exists() ? Object.keys(vocabSnapshot.val()).length : 0;

            const newWord = {
                id: length + 1,
                question: word,
                answer: translate,
            };

            const newWordRef = child(vocabularyRef, `c${length + 1}`);
            await set(newWordRef, newWord);

            setWord('');
            setTranslate('');
            message.success('Thêm từ thành công!', 1.5);
        } catch (error) {
            console.error('Lỗi khi thêm từ mới:', error);
            message.error('Thêm từ thất bại. Vui lòng thử lại!', 1.5);
        }
    };

    if (!load) {
        return <div>Đang tải...</div>;
    }

    return (
        <div className={styles.container}>
            <Header />
            <h1 style={{ textTransform: 'uppercase', textAlign: 'center' }}>Danh sách bài học</h1>
            <div className={styles.NavigateLesson}>
                {Object.keys(data).map((item, index) => (
                    <div key={item} className={styles.Lesson}>
                        <Link to={`/Objectquiz/${item}`}>
                            <Button disabled={vocabularyLengths[item] <= 3} style={{ width: '200px' }}>
                                {item}
                            </Button>
                        </Link>
                        <Button onClick={() => showModal(item)}>+</Button>
                        <Button onClick={() => showModalWord(item)}><DatabaseOutlined /></Button>
                        <Button><CloseOutlined /></Button>
                    </div>
                ))}
            </div>
            {/* Modal Thêm từ */}
            <Modal
                title="Thêm từ vựng"
                open={open}
                onOk={handleAddWord}
                onCancel={hideModal}
                okText="Thêm"
                cancelText="Thoát"
            >
                <label htmlFor="Word">Từ tiếng Anh:</label>
                <Input
                    id="Word"
                    placeholder="Nhập từ vựng"
                    value={word}
                    onChange={(e) => setWord(e.target.value)}
                />
                <label htmlFor="Translate" style={{ marginTop: '10px', display: 'block' }}>Nghĩa tiếng Việt:</label>
                <Input
                    id="Translate"
                    placeholder="Nhập nghĩa của từ"
                    value={translate}
                    onChange={(e) => setTranslate(e.target.value)}
                />
            </Modal>

            {/* Modal Danh sách từ */}
            <Modal
                className='custom-modal-2'
                title="Danh sách từ vựng"
                open={openWord}
                onCancel={hideModalWord}
                footer={null}
            >
                <Input
                    type="text"
                    placeholder="Tìm từ tiếng Anh..."
                    value={searchTerm}
                    onChange={handleSearch}
                    style={{ marginBottom: '10px' }}
                />
                <div className={styles.ListWordModal}>
                    <div className={styles.Layout}>
                        {dataModal
                            .filter((item) => item.question.toLowerCase().includes(searchTerm.toLowerCase()))
                            .map((item) => (
                                <div key={item.id} style={{ marginBottom: '15px', width: '40%' }}>
                                    <p><strong>Id: {item.id}</strong></p>
                                    {/* <p><strong>Id: {item.id}</strong> <button onClick={() => handleDelete(item.id)}>Xóa</button></p> */}
                                    <p><strong>Từ tiếng Anh:</strong> {item.question}</p>
                                    <p><strong>Nghĩa:</strong> {item.answer}</p>
                                </div>
                            ))}
                    </div>
                    <Modal
                        title="Xác nhận xóa từ vựng"
                        open={showConfirm}
                        onOk={confirmDelete}
                        onCancel={cancelDelete}
                    >
                        <p>Bạn có chắc chắn muốn xóa từ vựng này?</p>
                    </Modal>

                </div>
            </Modal>
        </div>
    );
}
