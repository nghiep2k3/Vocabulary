import React, { useEffect, useState } from 'react';
import styles from './Header.module.css';
import { SettingOutlined } from '@ant-design/icons';
import { Button, Modal, Input, message } from 'antd';
import { child, get, ref, set } from 'firebase/database';
import { database } from '../../firebase';

export default function Header() {
  const dbRef = ref(database);
  const [open, setOpen] = useState(false);
  const [word, setWord] = useState(''); // State lưu từ tiếng Anh
  const [data, setData] = useState(''); 
  const [translate, setTranslate] = useState(''); // State lưu nghĩa tiếng Việt
  const [length, setLength] = useState(0);
  const [loading, setLoading] = useState(false);
  const showModal = () => {
    setOpen(true);
  };
  console.log("Đây là length",  length);

  const hideModal = () => {
    setOpen(false);
  };

  useEffect(() => {
    const fetchData = async () => {
        try {
            const snapshot = await get(child(dbRef, `Vocabulary`));
            if (snapshot.exists()) {
                setData(snapshot.val());
                setLength(Object.keys(snapshot.val()).length);
                console.log("data zzz", snapshot.val());
                setLoading(true);
            } else {
                console.log("Không có dữ liệu");
            }
        } catch (error) {
            console.error(error);
        }
    };

    fetchData();
}, []);

  const handleAddWord = (values) => {

    if (word == "" || translate == "") {
      message.error('Thêm thất bại', 1.5);
      return;
    }
    console.log('Success:', values);
    message.success('Thêm thành công', 1.5);
    console.log(1111, length, word, translate);

    const dataAdd = {
      id: length + 1,
      question: word,
      answer: translate,
      // delete: handleEmail,
    };

    console.log('Data to add:', dataAdd);
    // Ghi dữ liệu vào database
    set(ref(database, `Vocabulary/c${length + 1}`), dataAdd);
    setLength(length + 1);
    setTranslate("");
    setWord("");
    setOpen(false);
  };

  return (
    <div className={styles.header}>
      <div>
        {
          loading ?
            <div>
              <button className={styles.addWord} onClick={showModal}>
                Thêm từ mới
              </button>
              {/* <button className={styles.ListWord} onClick={showModal}>
                Danh sách các từ
              </button> */}
              <Modal
                title="Thêm từ vựng"
                open={open}
                onOk={handleAddWord}
                onCancel={hideModal}
                okText="Thêm"
                cancelText="Thoát"
              >
                {/* Input cho từ tiếng Anh */}
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
            : 'đang tải....'}

      </div>
      <div className={styles.banner}>Vocabulary</div>
      <div className={styles.setting}>
        <SettingOutlined style={{ fontSize: '30px', color: 'white' }} />
      </div>
    </div>
  );
}
