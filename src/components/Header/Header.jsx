import React, { useEffect, useState } from 'react';
import styles from './Header.module.css';
import { SettingOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { Button, Modal, Input, message, Dropdown, Menu } from 'antd';
import { child, get, ref, set } from 'firebase/database';
import { database } from '../../firebase';
import link from '../../assets/fakelove.mp3'

export default function Header() {
  const dbRef = ref(database);
  const [open, setOpen] = useState(false);
  const [openSetting, setOpenSetting] = useState(false);
  const [word, setWord] = useState('');
  const [translate, setTranslate] = useState('');
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

  const handleAddWord = () => {
    if (word === '' || translate === '') {
      message.error('Thêm thất bại', 1.5);
      return;
    }

    const dataAdd = {
      id: length + 1,
      question: word,
      answer: translate,
    };

    set(ref(database, `Vocabulary/c${length + 1}`), dataAdd);
    setLength(length + 1);
    setTranslate('');
    setWord('');
    message.success('Thêm thành công', 1.5);
  };

  const menu = (
    <Menu>
      <Menu.Item key="1" onClick={showModal}>
        Thêm từ mới
      </Menu.Item>
      <Menu.Item key="2" onClick={showModal}>
        Danh sách các từ
      </Menu.Item>
      <Menu.Item key="3" onClick={showModalSetting}>
        Cài đặt
      </Menu.Item>
    </Menu>
  );

  return (
    <div className={styles.header}>
      <div className={styles.banner}>Vocabulary</div>
      <div className={styles.setting}>
        <Dropdown overlay={menu} placement="bottomLeft" trigger={['click']}>
          <Button><UnorderedListOutlined /></Button>
        </Dropdown>
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
      <Modal
        title="Cài đặt"
        open={openSetting}
        onOk={hideModalSetting}
        onCancel={hideModalSetting}
        okText="Lưu"
        cancelText="Thoát"
      >
        <audio controls src={link}></audio>
      </Modal>
    </div>
  );
}
