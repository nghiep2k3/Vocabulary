import React, { useEffect, useState } from 'react';
import styles from './Lesson.module.css';
import { Link } from 'react-router-dom';
import { Button, Modal, Input, message } from 'antd';
import { ref, get, child, set, remove } from 'firebase/database';
import { database } from '../../firebase';
import Header from '../Header/Header';
import { CloseOutlined, DatabaseOutlined } from '@ant-design/icons';

import Dev from "../Dev/Dev"
import Dev2 from "../Dev/Dev2"

export default function Lesson() {
    const dbRef = ref(database);
    const [data, setData] = useState({});
    const [dataModal, setDataModal] = useState([]);
    const [open, setOpen] = useState(false);
    const [openWord, setOpenWord] = useState(false);
    const [word, setWord] = useState('');
    const [translate, setTranslate] = useState('');
    const [itemEdit, setItemEdit] = useState();
    const [editWord, setEditWord] = useState('');
    const [editTranslate, setEditTranslate] = useState('');
    const [selectedItem, setSelectedItem] = useState('');
    const [load, setLoad] = useState(false);
    const [vocabularyLengths, setVocabularyLengths] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);
    const [showConfirmLesson, setShowConfirmLesson] = useState(false);
    const [showConfirmDeleteLesson, setShowConfirmDeleteLesson] = useState(false);
    const [idToDelete, setIdToDelete] = useState(null);
    const [idEdit, setIdEdit] = useState(null);

    const [musicPlaying, setMusicPlaying] = useState(false);
    const toggleMusic = () => {
        setMusicPlaying((prevState) => !prevState);
    };
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


    const handleEdit = async (id) => {
        console.log(id);
        setIdEdit(id);
        console.log(selectedItem);
        const vocabularyRef = child(dbRef, `${selectedItem}/Vocabulary/c${id}`);
        try {
            const vocabSnapshot = await get(vocabularyRef);

            if (vocabSnapshot.exists()) {
                const vocabData = vocabSnapshot.val();
                console.log(vocabData);
                setEditWord(vocabSnapshot.val().question);
                setEditTranslate(vocabSnapshot.val().answer);
            }
        } catch (error) {
            console.error(`Lỗi khi lấy danh sách từ vựng cho ${selectedItem}:`, error);
        }
        setShowConfirm(true);
    }

    const handleDeleteLesson = (item) => {
        setSelectedItem(item);
        setShowConfirmDeleteLesson(true);
    };


    const cancelDeleteLesson = () => {
        setShowConfirmDeleteLesson(false);
        setIdToDelete(null);
    };

    const ConfirmDeleteLesson = async () => {
        try {
            const itemPath = `${selectedItem}`;
            await remove(child(dbRef, itemPath));

            const updatedData = Object.keys(data).filter(key => key !== selectedItem).reduce((obj, key) => {
                obj[key] = data[key];
                return obj;
            }, {});

            // Cập nhật state data mới đã xóa bài học
            setData(updatedData);

            // Gửi tin nhắn thành công

            // Đặt lại các state và đóng modal
            setShowConfirmDeleteLesson(false);
            setSelectedItem(null);

            message.success(`Xóa thành công`);
        } catch (error) {
            console.error("Lỗi khi xóa bài học:", error);
            message.error("Đã xảy ra lỗi khi xóa bài học. Vui lòng thử lại sau.");
        }
    };



    const confirmEdit = async () => {
        try {
            const itemPath = `${selectedItem}/Vocabulary/c${idEdit}`;
            console.log(itemPath);
            const newWord = {
                id: idEdit,
                question: editWord,
                answer: editTranslate,
            };

            await set(ref(database, itemPath), newWord);

        } catch (error) {
            console.error("Lỗi khi xóa từ vựng:", error);
        } finally {
            setShowConfirm(false);
            setIdEdit(null);
        }
    };


    const cancelEdit = () => {
        setShowConfirm(false);
        setIdEdit(null);
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
                        <Button onClick={() => handleDeleteLesson(item)}><CloseOutlined /></Button>
                    </div>
                ))}

            </div>

            <div>
                <h1>Music Player App</h1>
                <Dev toggleMusic={toggleMusic} />
                <Dev2 musicPlaying={musicPlaying} />
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
                                    {/* <p><strong>Id: {item.id}</strong></p> */}
                                    {/* <p><strong>Id: {item.id}</strong> <button onClick={() => handleDelete(item.id)}>Xóa</button></p> */}
                                    <p><strong>Id: {item.id}</strong> <button onClick={() => handleEdit(item.id)}>Chỉnh sửa</button></p>
                                    <p><strong>Từ tiếng Anh:</strong> {item.question}</p>
                                    <p><strong>Nghĩa:</strong> {item.answer}</p>
                                </div>
                            ))}
                    </div>
                    <Modal
                        title="Chỉnh sửa từ vựng"
                        open={showConfirm}
                        onOk={confirmEdit}
                        onCancel={cancelEdit}
                    >
                        <p>Chỉnh sửa từ vựng?</p>
                        <label htmlFor="EditWord">Câu hỏi:</label>
                        <Input
                            id="EditWord"
                            placeholder="Câu hỏi..."
                            value={editWord}
                            onChange={(e) => setEditWord(e.target.value)}
                        />
                        <label htmlFor="EditTranslate" style={{ marginTop: '10px', display: 'block' }}>Đáp án:</label>
                        <Input
                            id="EditTranslate"
                            placeholder="Đáp án..."
                            value={editTranslate}
                            onChange={(e) => setEditTranslate(e.target.value)}
                        />
                    </Modal>
                </div>
            </Modal>

            <Modal
                title="Bạn có chắc muốn xóa bài học này không"
                open={showConfirmDeleteLesson}
                onOk={ConfirmDeleteLesson}
                onCancel={cancelDeleteLesson}
            >
                <p>Bạn có chắc muốn xóa bài học này không?</p>
            </Modal>
        </div>
    );
}
