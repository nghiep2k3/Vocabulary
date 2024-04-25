import React, { useEffect, useState } from 'react'
import styles from './Result.module.css'
import { Button } from 'antd';
import { RollbackOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

export default function Result() {
    const navigate = useNavigate();
    const [data, setData] = useState('');
    const [questionTrue, setQuestionTrue] = useState(0);
    const [questionFalse, setQuestionFalse] = useState(0);
    const [questionUndefine, setQuestionUndefine] = useState(0);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    useEffect(() => {
        const storedTrue = localStorage.getItem('True');
        const storedFalse = localStorage.getItem('False');
        const storedUndefine = localStorage.getItem('Undefine');
        if (storedTrue || storedFalse) {
            setQuestionTrue(storedTrue)
            setQuestionFalse(storedFalse)
            setQuestionUndefine(storedUndefine)
        } else {
            const defaultName = 'User';
            localStorage.setItem('name', defaultName);
        }
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);
    const Home = () => {
        navigate("/");
    }
    return (
        <div>
            <div className={styles.Container}>
                <h2 style={{ textAlign: 'center' }}>Kết quả</h2>
                <div className={styles.ResultQuiz}>
                    <p className={styles.Text}>Số câu đúng: {questionTrue}</p>
                    <p className={styles.Text}>Số câu sai: {questionFalse}</p>
                    <p className={styles.Text}>Số câu bỏ qua: {questionUndefine}</p>
                </div>
                <h2 style={{ textAlign: 'center' }}>Danh sách câu làm sai</h2>
                <div className={styles.FooterList}>
                    d
                </div>
                <div className={styles.btnHome}><Button onClick={Home}>{(windowWidth <= 767) ? "Quay lại trang chủ" : <RollbackOutlined />}</Button></div>
            </div>
        </div>
    )
}
