import React, { useEffect, useState } from "react";
import { getDatabase, ref, child, get, remove } from "firebase/database";
import { Input, Modal, } from 'antd';
import styles from "./ListWord.module.css"
import { LeftOutlined } from '@ant-design/icons';
import {useNavigate, Link} from "react-router-dom"

import { database } from "../../firebase";

export default function ListWord() {
    const navigate = useNavigate();
    const dbRef = ref(database);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showConfirm, setShowConfirm] = useState(false);
    const [idToDelete, setIdToDelete] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const snapshot = await get(child(dbRef, `Bài 1/Vocabulary`));
                if (snapshot.exists()) {
                    const vocabularyData = snapshot.val();
                    setData(Object.values(vocabularyData));
                    setLoading(false);
                } else {
                    console.log("Không có dữ liệu");
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, []);

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleDelete = (id) => {
        setIdToDelete(id);
        setShowConfirm(true);
    };

    const confirmDelete = async () => {
        try {
            await remove(child(dbRef, `Bài 1/c${idToDelete}`));
            const updatedData = data.filter(item => item.id !== idToDelete);
            setData(updatedData);
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

    const filteredData = data.filter(item =>
        item.question.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const HandleQuit = () =>{
        navigate("/Objectquiz")
        window.location.reload();
    }

    if (loading) {
        return (
            <div style={{ backgroundColor: '#c9bcbc', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                Đang tải...
            </div>
        );
    }

    const midIndex = Math.ceil(filteredData.length / 2);
    const firstHalf = filteredData.slice(0, midIndex);
    const secondHalf = filteredData.slice(midIndex);

    return (
        <div style={{ backgroundColor: '#c9bcbc', height: '100vh' }}>
            <div style={{ backgroundColor: '#c9bcbc', padding: '20px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h1 style={{ textTransform: 'uppercase' }}>
                    Danh sách từ vựng
                </h1>

                <div style={{width: '100%', display: 'flex', justifyContent: 'center', alignItems:'center', position: 'relative'}}>
                    <button onClick={HandleQuit} className={styles.quit}><LeftOutlined /></button>
                    <Input
                        styles={{width: "80%"}}
                        type="text"
                        placeholder="Tìm từ tiếng Anh..."
                        style={{ marginBottom: '20px', padding: '10px', width: '80%', fontSize: '16px' }}
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>

                <div style={{ display: 'flex', width: '100%', justifyContent: 'space-around', marginTop: '20px' }}>
                    <div style={{ width: '45%' }}>
                        {firstHalf.map(item => (
                            <div key={item.id} style={{ marginBottom: '15px' }}>
                                <p><strong>Id: {item.id}</strong> <button onClick={() => handleDelete(item.id)}>Xóa</button></p>
                                <p><strong>Từ tiếng Anh:</strong> {item.question}</p>
                                <p><strong>Nghĩa:</strong> {item.answer}</p>
                            </div>
                        ))}
                    </div>
                    <div style={{ width: '45%' }}>
                        {secondHalf.map(item => (
                            <div key={item.id} style={{ marginBottom: '15px' }}>
                                <p><strong>Id: {item.id}</strong> <button onClick={() => handleDelete(item.id)}>Xóa</button></p>
                                <p><strong>Từ tiếng Anh:</strong> {item.question}</p>
                                <p><strong>Nghĩa:</strong> {item.answer}</p>
                            </div>
                        ))}
                    </div>
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
        </div>
    );
}
