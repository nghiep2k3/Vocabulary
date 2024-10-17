import React, { useEffect, useState } from 'react';
import styles from './Lesson.module.css';
import { Link } from 'react-router-dom';
import { Button, Modal, Input, message, Form } from 'antd';
import { ref, get, child, set, remove } from 'firebase/database';
import { database } from '../../firebase';
import Header from '../Header/Header';
import { CloseOutlined, DatabaseOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';

export default function Lesson() {
    const dbRef = ref(database);
    const [form] = Form.useForm();
    const [data, setData] = useState({});
    const [dataWord, setDataWord] = useState({});
    const [dataModal, setDataModal] = useState([]);
    const [open, setOpen] = useState(false);
    const [openWord, setOpenWord] = useState(false);
    const [word, setWord] = useState('');
    const [translate, setTranslate] = useState('');
    const [editWord, setEditWord] = useState('');
    const [editTranslate, setEditTranslate] = useState('');
    const [selectedItem, setSelectedItem] = useState('');
    const [load, setLoad] = useState(false);
    const [vocabularyLengths, setVocabularyLengths] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);
    const [showConfirmLesson, setShowConfirmLesson] = useState(false);
    const [showConfirmDeleteLesson, setShowConfirmDeleteLesson] = useState(false);
    const [showConfirmDeleteWord, setShowConfirmDeleteWord] = useState(false);
    const [idEdit, setIdEdit] = useState(null);
    const [itemWord, setItemWord] = useState(null);

    useEffect(() => {
        const fetchVocabularyLengths = async () => {
            const snapshot = await get(dbRef);

            if (snapshot.exists()) {
                const dataValue = snapshot.val();
                setData(dataValue);

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
                setLoad(true);
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


    const handleEdit = async (ref) => {
        console.log(ref);
        setIdEdit(ref);
        console.log(selectedItem);
        const vocabularyRef = child(dbRef, `${selectedItem}/Vocabulary/${ref}`);
        try {
            const vocabSnapshot = await get(vocabularyRef);
            const vocabData = vocabSnapshot.val();
            console.log(vocabData);
            setEditWord(vocabSnapshot.val().question);
            setEditTranslate(vocabSnapshot.val().answer);
        } catch (error) {
            console.error(`Lỗi khi lấy danh sách từ vựng cho ${selectedItem}:`, error);
        }
        setShowConfirm(true);
    }

    const handleDelete = async (item) => {
        setShowConfirmDeleteWord(true);
        setItemWord(item);

    }

    const cancelDeleteWord = () => {
        setShowConfirmDeleteWord(false);
    };

    const confirmDeleteWord = async () => {
        console.log(itemWord);
        console.log(selectedItem);
        try {
            const itemPath = `${selectedItem}/Vocabulary/${itemWord}`;
            console.log(itemPath);
            await remove(child(dbRef, itemPath));


            let snapshot = await get(child(dbRef, `${selectedItem}/Vocabulary`));
            setDataModal(Object.values(snapshot.val()));


            message.success(`Xóa thành công`);
        } catch (error) {
            console.error("Lỗi khi xóa bài học:", error);
            message.error("Đã xảy ra lỗi khi xóa bài học. Vui lòng thử lại sau.");
        } finally {
            setItemWord(null);
            setShowConfirmDeleteWord(false);
        }
    }

    const handleDeleteLesson = (item) => {
        setSelectedItem(item);
        setShowConfirmDeleteLesson(true);
    };


    const cancelDeleteLesson = () => {
        setShowConfirmDeleteLesson(false);
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
            const itemPath = `${selectedItem}/Vocabulary/${idEdit}`;
            console.log(itemPath);
            const newWord = {
                id: idEdit,
                question: editWord,
                answer: editTranslate,
            };

            await set(ref(database, itemPath), newWord);

        } catch (error) {
            console.error("Lỗi khi sửa từ vựng:", error);
        } finally {
            setIdEdit(null);
            setShowConfirm(false);
        }
    };


    const cancelEdit = () => {
        setShowConfirm(false);
        setIdEdit(null);
    };

    const handleAddWord = async (values) => {
        const { word, translate } = values;

        if (!word || !translate) {
            message.error('Vui lòng nhập từ và nghĩa của từ!', 1.5);
            return;
        }

        const vocabularyRef = child(dbRef, `${selectedItem}/Vocabulary`);

        try {
            const vocabSnapshot = await get(vocabularyRef);
            const length = vocabSnapshot.exists() ? Object.keys(vocabSnapshot.val()).length : 0;
            console.log(length);
            const randomUUID = uuidv4();
            console.log(7846387, randomUUID);
            const newWord = {
                id: length + 1,
                ref: randomUUID,
                question: translate,
                answer: word,
            };

            const newWordRef = child(vocabularyRef, `${randomUUID}`);
            console.log(newWord);
            await set(newWordRef, newWord);
            form.resetFields();
            // setWord('');
            // setTranslate('');
            message.success('Thêm từ thành công!', 1.5);
        } catch (error) {
            console.error('Lỗi khi thêm từ mới:', error);
            message.error('Thêm từ thất bại. Vui lòng thử lại!', 1.5);
        }
    };


    if (!load) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'white' }}>Đang tải...</div>;
    }

    return (
        <div className={styles.container}>
            <Header />
            <h1 style={{ textAlign: 'center' }}>Danh sách bài học</h1>
            <div className={styles.NavigateLesson}>
                {Object.keys(data).map((item, index) => (
                    <div key={item} className={styles.Lesson}>
                        <Link to={`/Objectquiz/${item}`}>
                            <Button disabled={vocabularyLengths[item] <= 3} style={{ width: '200px', marginRight: '10px' }}>
                                {item}
                            </Button>
                        </Link>
                        <Button style={{ marginRight: '10px' }} onClick={() => showModal(item)}>+</Button>
                        <Button style={{ marginRight: '10px' }} onClick={() => showModalWord(item)}><DatabaseOutlined /></Button>
                        <Button style={{ marginRight: '10px' }} onClick={() => handleDeleteLesson(item)}><CloseOutlined /></Button>
                    </div>
                ))}

            </div>

            {/* Modal Thêm từ */}
            <Modal
                title="Thêm từ vựng"
                open={open}
                onCancel={hideModal}
                onOk={() => form.submit()}
                okText="Thêm"
                cancelText="Thoát"
            >
                <Form form={form} onFinish={handleAddWord}>
                    <Form.Item
                        label="Từ tiếng Anh:"
                        name="word"
                    // rules={[{ required: true, message: 'Vui lòng nhập từ tiếng Anh!' }]}
                    >
                        <Input
                            style={{ position: 'absolute', right: '0', top: '0', width: "350px" }}
                            placeholder="Nhập từ vựng"

                        // onPressEnter={() => form.submit()}
                        />
                    </Form.Item>
                    <Form.Item
                        label="Nghĩa tiếng Việt:"
                        name="translate"
                    // rules={[{ required: true, message: 'Vui lòng nhập nghĩa của từ!' }]}
                    >
                        <Input
                            style={{ position: 'absolute', right: '0', top: '0', width: "350px" }}

                            placeholder="Nhập nghĩa của từ"
                            onPressEnter={() => form.submit()}
                        />
                    </Form.Item>
                </Form>
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
                            .map((item, index) => (
                                <div key={item.id} style={{ marginBottom: '15px', width: '45%', fontSize: '18px', }}>
                                    <div><strong>Id: {index + 1}</strong>
                                        <button style={{ margin: '0 10px' }} onClick={() => handleEdit(item.ref)}><EditOutlined style={{ fontSize: '17px' }} /></button>
                                        <button onClick={() => handleDelete(item.ref)}><DeleteOutlined style={{ fontSize: '17px' }} /></button>
                                    </div>
                                    <p><strong>Question:</strong> {item.answer}</p>
                                    <p><strong>Answer:</strong>  {item.question}</p>
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

                    <Modal
                        title="Bạn có chắc muốn xóa bài học này không"
                        open={showConfirmDeleteWord}
                        onOk={confirmDeleteWord}
                        onCancel={cancelDeleteWord}
                    >
                        <p>Bạn có chắc muốn xóa bài học này không?</p>
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
