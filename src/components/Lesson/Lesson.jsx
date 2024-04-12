import React, { useEffect, useState } from 'react';
import styles from './Lesson.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Modal, Input, message } from 'antd';
import { ref, get, set, child } from 'firebase/database';
import { database } from '../../firebase';
import Header from '../Header/Header';
import { DatabaseOutlined } from '@ant-design/icons';

export default function Lesson() {
    const navigate = useNavigate();
    const dbRef = ref(database);
    const [data, setData] = useState({});
    const [open, setOpen] = useState(false);
    const [openWord, setOpenWord] = useState(false);
    const [word, setWord] = useState('');
    const [translate, setTranslate] = useState('');
    const [selectedItem, setSelectedItem] = useState('');
    const [load, setLoad] = useState(false);
    const [vocabularyLengths, setVocabularyLengths] = useState({});

    useEffect(() => {
        const fetchVocabularyLengths = async () => {
            const dbRef = ref(database);
            const snapshot = await get(dbRef); // Lấy snapshot của nút gốc
            setData(snapshot.val());
            setLoad(true);
            if (snapshot.exists()) {
                const vocabularyPaths = Object.keys(snapshot.val());

                const lengths = {};

                for (const path of vocabularyPaths) {
                    const vocabularyRef = child(ref(database), `${path}/Vocabulary`);
                    try {
                        const vocabularySnapshot = await get(vocabularyRef);
                        if (vocabularySnapshot.exists()) {
                            lengths[path] = Object.keys(vocabularySnapshot.val()).length;
                        } else {
                            lengths[path] = 0;
                        }
                    } catch (error) {
                        console.error(`Lỗi khi lấy độ dài của ${path}:`, error);
                        lengths[path] = 0;
                    }
                }

                setVocabularyLengths(lengths); // Cập nhật state với các độ dài của các Vocabulary
            }
        };

        fetchVocabularyLengths();
    }, []);

    const showModal = (item) => {
        setSelectedItem(item); // Lưu trữ `item` được chọn vào state
        setOpen(true);
    };

    const hideModal = () => {
        setOpen(false);
        window.location.reload();
    };

    const showModalWord = async (item) => {
        setSelectedItem(item);
        const snapshot = await get(child(dbRef, `${item}/Vocabulary`));
        console.log("data modal:",snapshot.val());
        setOpenWord(true);
    };

    const hideModalWord = () => {
        setOpenWord(false);
    };

    const handleAddWord = async () => {
        const snapshot = await get(child(dbRef, `${selectedItem}/Vocabulary`));
        const length = Object.keys(snapshot.val()).length;

        if (word === '' || translate === '') {
            message.error('Thêm thất bại', 1.5);
            return;
        }

        const dataAdd = {
            id: length + 1,
            question: word,
            answer: translate,
        };

        const path = `${selectedItem}/Vocabulary/c${length + 1}`;
        set(ref(database, path), dataAdd);
        setTranslate('');
        setWord('');
        message.success('Thêm thành công', 1.5);
    };

    if (!load) {
        return <div>Đang tải...</div>;
    }

    return (
        <div className={styles.container}>
            <Header />
            <h1 style={{ textTransform: 'uppercase', textAlign: 'center' }}>Danh sách bài học</h1>
            <div>
                {Object.keys(data).map((item, index) => (
                    <div key={item} className={styles.Lesson}>
                        <Link to={`/Objectquiz/${item}`}>
                            <Button disabled={vocabularyLengths[item] < 3} style={{ width: '200px' }}>
                                {item}
                            </Button>
                        </Link>
                        <Button onClick={() => showModal(item)}>+</Button> {/* Gọi showModal với tham số `item` */}
                        <Button onClick={() => showModalWord(item)}><DatabaseOutlined /></Button> {/* Gọi showModal với tham số `item` */}
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
                <label htmlFor="Word" className={styles.label}>
                    Từ tiếng Anh:
                </label>
                <Input
                    id="Word"
                    placeholder="Từ vựng"
                    value={word}
                    onChange={(e) => setWord(e.target.value)}
                />
                <label style={{ marginTop: '5px' }} htmlFor="Translate" className={styles.label}>
                    Nghĩa tiếng Việt:
                </label>
                <Input
                    id="Translate"
                    placeholder="Nghĩa của từ"
                    value={translate}
                    onChange={(e) => setTranslate(e.target.value)}
                />
            </Modal>

            {/* Modal Danh sách từ */}
            <Modal
                title="Danh sách từ"
                open={openWord}
                // onOk={handleAddWord}
                onCancel={hideModalWord}
                okText="Thêm"
                cancelText="Thoát"
            >
                
            </Modal>
        </div>
    );
}
