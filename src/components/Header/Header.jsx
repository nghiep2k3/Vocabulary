import React, { useEffect, useState } from 'react';
import styles from './Header.module.css';
import { SettingOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { Button, Modal, Input, message, Dropdown, Menu } from 'antd';
import { child, get, ref, set } from 'firebase/database';
import { database } from '../../firebase';
import link from '../../assets/fakelove.mp3'
import { Route, Routes, Link, Outlet, useNavigate } from "react-router-dom";

export default function Header() {
    const navigate = useNavigate();
    const dbRef = ref(database);
    const [open, setOpen] = useState(false);
    const [openSetting, setOpenSetting] = useState(false);
    const [titleLesson, setTitleLesson] = useState('');
    const [length, setLength] = useState(0);

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
            id: Length + 1,
            question: "",
            answer: "",
        };

        console.log(Length);
        console.log(dataAdd);
        const path = `${titleLesson}/Vocabulary/c1`;
        set(ref(database, path), dataAdd);
        setLength(length + 1);
        setTitleLesson('');
        message.success('Thêm thành công', 1.5);
    };
    const Start = () => {
        navigate("/Lesson");
    }
    const ListWord = () => {
        navigate("/ListWord");
    }

    const HomePage = () => {
        navigate("/Objectquiz")
    }

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
                <Dropdown overlay={menu} placement="bottomLeft" trigger={['click']}>
                    <Button><UnorderedListOutlined /></Button>
                </Dropdown>
            </div>
            <Modal
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
                onOk={hideModalSetting}
                onCancel={hideModalSetting}
                okText="Lưu"
                cancelText="Thoát"
            >
                <audio style={{ width: '100%' }} controls loop src={link}></audio>
            </Modal>
        </div>
    );
}
