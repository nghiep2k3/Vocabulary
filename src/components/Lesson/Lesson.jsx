import React, { useEffect, useState } from 'react';
import styles from './Lesson.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Modal, Input, message } from 'antd';
import { ref, get, set, child } from 'firebase/database';
import { database } from '../../firebase';
import Header from '../Header/Header';

export default function Lesson() {
    const navigate = useNavigate();
    const dbRef = ref(database);
    const [data, setData] = useState({});
    const [open, setOpen] = useState(false);
    const [word, setWord] = useState('');
    const [translate, setTranslate] = useState('');
    const [selectedItem, setSelectedItem] = useState('');
    const [load, setLoad] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const snapshot = await get(dbRef);
                if (snapshot.exists()) {
                    setData(snapshot.val());
                    setLoad(true);
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, []);

    const showModal = (item) => {
        setSelectedItem(item); // Lưu trữ `item` được chọn vào state
        setOpen(true);
    };

    const hideModal = () => {
        setOpen(false);
        window.location.reload();
    };

    const handleAddWord = async () => {
        const snapshot = await get(child(dbRef, `${selectedItem}/Vocabulary`));
        const Length = Object.keys(snapshot.val()).length;

        if (word === '' || translate === '') {
            message.error('Thêm thất bại', 1.5);
            return;
        }



        const dataAdd = {
            id: Length + 1,
            question: word,
            answer: translate,
        };

        console.log(Length);
        console.log('selectedItem', selectedItem);
        const path = `${selectedItem}/Vocabulary/c${Length + 1}`;
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
                            <Button style={{ width: '200px' }}>{item}</Button>
                        </Link>

                        <Button onClick={() => showModal(item)}>+</Button> {/* Gọi showModal với tham số `item` */}
                    </div>
                ))}
            </div>
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
        </div>
    );
}
