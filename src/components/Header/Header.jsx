import React, { useEffect, useRef, useState } from 'react';
import styles from './Header.module.css';
import { SettingOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { Button, Modal, Input, message, Dropdown, Menu, Form } from 'antd';
import { child, get, ref, set } from 'firebase/database';
import { database } from '../../firebase';
import link from '../../assets/fakelove.mp3';
import link2 from '../../assets/Lanterns.mp3';
import { useNavigate } from "react-router-dom";
import { useAudioContext } from '../../AudioContext';

export default function Header() {
    const navigate = useNavigate();
    const dbRef = ref(database);
    const audioRefs = useRef({});
    const [open, setOpen] = useState(false);
    const { isPlaying, togglePlay } = useAudioContext();
    const [openSetting, setOpenSetting] = useState(false);
    const [titleLesson, setTitleLesson] = useState('');
    const [length, setLength] = useState(0);
    const [linkSrc] = useState([
        { id: 1, name: "Fake Love", src: link },
        { id: 2, name: "Lanterns", src: link2 }
    ]);

    const showModal = () => {
        setOpen(true);
    };

    const hideModal = () => {
        setOpen(false);
        window.location.reload();
    };

    const showModalSetting = () => {
        setOpenSetting(true);
    };

    const hideModalSetting = () => {
        setOpenSetting(false);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const snapshot = await get(child(dbRef, `Vocabulary`));
                if (snapshot.exists()) {
                    setLength(Object.keys(snapshot.val()).length);
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, []);

    const handleAddWord = async () => {
        if (titleLesson === '') {
            message.error('Thêm thất bại', 1.5);
            return;
        }

        const snapshot = await get(dbRef);
        const Length = Object.keys(snapshot.val()).length;

        const dataAdd = {
            id: 1,
            question: "",
            answer: "",
        };

        const path = `${titleLesson}/Vocabulary/`;
        set(ref(database, path), "");
        setLength(length + 1);
        setTitleLesson('');
        message.success('Thêm thành công', 1.5);
    };

    const Start = () => {
        navigate("/Lesson");
    };

    const HomePage = () => {
        navigate("/Lesson");
    };

    const menu = (
        <Menu>
            <Menu.Item key="1" onClick={showModal}>
                Thêm bài học
            </Menu.Item>
            <Menu.Item key="2" onClick={Start}>
                Danh sách bài học
            </Menu.Item>
            <Menu.Item key="3" onClick={showModalSetting}>
                Cài đặt
            </Menu.Item>
        </Menu>
    );


    return (
        <div className={styles.header}>
            <div className={styles.banner} onClick={HomePage}>Vocabulary</div>
            <div className={styles.setting}>
                <div>
                    <Button onClick={togglePlay}>
                        {isPlaying  ? <span className="material-symbols-outlined">volume_up</span> : <span className="material-symbols-outlined">volume_off</span>}
                    </Button>
                </div>
                <Dropdown overlay={menu} placement="bottomLeft" trigger={['click']}>
                    <Button><UnorderedListOutlined /></Button>
                </Dropdown>
            </div>
            <Modal
                className="custom-modal-1"
                title="Học là mãi mãi :)))"
                open={open}
                onOk={handleAddWord}
                onCancel={hideModal}
                okText="Thêm"
                cancelText="Thoát"
            >
                <label htmlFor="Word" className={styles.label}>
                    Tên bài học:
                </label>
                <Input
                    id="Word"
                    placeholder="Cuộc sống quá áp lực với chúng ta..."
                    value={titleLesson}
                    onChange={(e) => setTitleLesson(e.target.value)}
                />
            </Modal>
            <Modal
                title="Cài đặt"
                open={openSetting}
                onCancel={hideModalSetting}
                okText="Lưu"
                cancelText="Thoát"
            >
                {linkSrc.map((item) => (
                    <div key={item.id}>
                        <b>Name: {item.name}</b>
                        <audio ref={(el) => (audioRefs.current[item.id] = el)} style={{ width: '100%' }} controls loop src={item.src}></audio>
                    </div>
                ))}

            </Modal>
        </div>
    );
}
