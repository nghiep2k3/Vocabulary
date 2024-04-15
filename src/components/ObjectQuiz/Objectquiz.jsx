import React, { useEffect, useState, useRef } from "react";
import { useParams } from 'react-router-dom';
import { Alert } from 'antd';
import { CaretRightOutlined, UndoOutlined } from '@ant-design/icons';
import { database } from "../../firebase";
import 'animate.css';
import styles from "./objectquiz.module.css";
import link from '../../assets/fakelove.mp3';
import link2 from '../../assets/Lanterns.mp3';
import { child, get, ref } from "firebase/database";

export default function Objectquiz() {
    const { quiz } = useParams();
    const [data, setData] = useState({});
    const [load, setLoad] = useState(true);
    const [percentQuiz, setPercentQuiz] = useState(0);
    const [Chargewidth, setChargeWidth] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [correctAnswer, setCorrectAnswer] = useState("");
    const [start, setStart] = useState(false);
    const [count1, setCount1] = useState(1);
    const [count2, setCount2] = useState(0);
    const [shuffledQuizData, setShuffledQuizData] = useState({});
    const [showMessage, setShowMessage] = useState(false);
    const [showMessage2, setShowMessage2] = useState(false);
    const [message, setMessage] = useState("");
    const [animate, setAnimate] = useState('');
    const [answerColor, setAnswerColor] = useState('');
    const [linkSrc, setLinkSrc] = useState([link, link2]);
    const colors = ['#00DD00', 'orange', '#FF3300', 'black', '#FF99CC', '#996600', '#708090', '#8B8989', 'black', '#FF99CC', '#00DD00', 'orange', '#708090', 'orange', '#FF3300', 'black'];
    const [colorIndex, setColorIndex] = useState(0);
    const audioRef = useRef(null); // Tham chiếu tới phần tử audio

    const dbRef = ref(database);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const snapshot = await get(child(dbRef, `${quiz}/Vocabulary`));
                if (snapshot.exists()) {
                    setData(snapshot.val());
                    setCount2(Object.keys(snapshot.val()).length);
                    setPercentQuiz(100 / Object.keys(snapshot.val()).length);
                    setChargeWidth(100 / Object.keys(snapshot.val()).length);
                    setLoad(false);
                } else {
                    console.log("Không có dữ liệu");
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (!load && Object.keys(data).length > 0) {
            const questionKeys = Object.keys(data);
            const shuffledQuestionKeys = shuffleArray(questionKeys);

            const newShuffledQuizData = {};
            shuffledQuestionKeys.forEach((key, index) => {
                newShuffledQuizData[`c${index + 1}`] = data[key];
            });

            setShuffledQuizData(newShuffledQuizData);
            setQuestionAndAnswers(newShuffledQuizData, 0);
        }
    }, [load, data]);


    const setQuestionAndAnswers = (quizData, index) => {
        const { question, answer } = quizData[`c${index + 1}`];

        const otherAnswers = Object.values(quizData)
            .map(item => item.answer)
            .filter(ans => ans !== answer);

        const randomAnswers = [answer];
        while (randomAnswers.length < 4) {
            const randomIndex = Math.floor(Math.random() * otherAnswers.length);
            const randomAnswer = otherAnswers[randomIndex];
            if (!randomAnswers.includes(randomAnswer)) {
                randomAnswers.push(randomAnswer);
            }
        }

        randomAnswers.sort(() => Math.random() - 0.5);
        setAnswers(randomAnswers);
        setCorrectAnswer(answer);
        setCurrentQuestionIndex(index);

        const defaultColor = getRandomColor();
        setAnswerColor(defaultColor);
    };


    const handleNextQuestion = () => {
        setAnimate('animate__animated animate__backOutDown');

        if (!start) {
            setStart(true);
        }

        if (count1 === count2) {
            alert("Đã hết câu hỏi...");
            setCount1(1);
            setCurrentQuestionIndex(0);
            setStart(false);

            const questionKeys = Object.keys(data);
            const shuffledQuestionKeys = shuffleArray(questionKeys);

            const newShuffledQuizData = {};
            shuffledQuestionKeys.forEach((key, index) => {
                newShuffledQuizData[`c${index + 1}`] = data[key];
            });

            setShuffledQuizData(newShuffledQuizData);
            setQuestionAndAnswers(newShuffledQuizData, 0);
            setColorIndex(0);
            return;
        }
        setPercentQuiz(prevWidth => prevWidth + Chargewidth);
        setTimeout(() => {
            setQuestionAndAnswers(shuffledQuizData, currentQuestionIndex + 1);
            setCount1(count1 + 1);
            setAnimate('animate__animated animate__bounceInDown');
            setColorIndex(colorIndex + answers.length);
        }, 1000);
    };

    useEffect(() => {
        const element = document.querySelector('.NumberQuestion');
        if (!element) return;
        const style = window.getComputedStyle(element, '::before');
        const width = style.getPropertyValue('width');
        const parsedWidth = parseFloat(width);
        setPercentQuiz(parsedWidth);
      }, []);
      
      

    const ButtonStart = () => {
        setStart(true);
        setQuestionAndAnswers(shuffledQuizData, 0);
        setAnimate('animate__animated animate__backInLeft');
        setTimeout(() => setAnimate(''), 1000);
    };

    const playAudio = () => {
        const audioElement = audioRef.current;
        if (audioElement) {
            audioElement.play().catch(error => {
                console.error('Error playing audio:', error);
            });
        }
    };


    const AgainQuiz = () => {
        setAnimate('');
        setColorIndex(0);
        setCount1(1);
        setCurrentQuestionIndex(0);
        setStart(false);

        const questionKeys = Object.keys(data);
        const shuffledQuestionKeys = shuffleArray(questionKeys);

        const newShuffledQuizData = {};
        shuffledQuestionKeys.forEach((key, index) => {
            newShuffledQuizData[`c${index + 1}`] = data[key];
        });

        setShuffledQuizData(newShuffledQuizData);
        setQuestionAndAnswers(newShuffledQuizData, 0);
    };

    const checkAnswer = (selectedAnswer) => {
        if (selectedAnswer === correctAnswer) {
            setMessage("Chính xác!");
            setPercentQuiz(prevWidth => prevWidth + Chargewidth);
            setShowMessage(true);
            setTimeout(() => {
                handleNextQuestion();
            }, 1700)
        } else {
            setMessage("Sai rồi. Hãy thử lại!");
            setShowMessage2(true);
        }

        setTimeout(() => {
            setShowMessage(false);
            setShowMessage2(false);
            setMessage("");
        }, 1700);
    };

    const getRandomColor = () => {
        const index = Math.floor(Math.random() * colors.length);
        return colors[index];
    };


    if (load || !data || Object.keys(data).length === 0) {
        return <div style={{ color: 'white', fontSize: '20px' }}>Đang tải...</div>;
    }

    if (!start) {
        return (
            <div>
                <button onClick={ButtonStart} className={styles.Go}>Bắt đầu</button>
            </div>
        );
    }

    const { question } = shuffledQuizData[`c${currentQuestionIndex + 1}`];

    return (
        <div className={styles.backgroundQuiz}>
            {playAudio()}
            <div style={{ display: 'none' }}>
                <audio src={linkSrc[0]} ref={audioRef} controls>
                </audio>
            </div>
            <div style={{ width: '100%' }}>
                <div key={`question-${currentQuestionIndex}`}>
                    <p className={`${styles.quiz} ${animate}`}>{question}</p>
                </div>
                <div className={styles.allQuiz}>
                    {answers.map((answer, index) => (
                        <div
                            key={index}
                            className={`${styles.answer} ${animate}`}
                            onClick={() => checkAnswer(answer)}
                            style={{ backgroundColor: colors[(colorIndex + index) % colors.length] }}
                        >
                            {String.fromCharCode(65 + index)}. {answer}
                        </div>
                    ))}
                </div>
                <div className={styles.alertAnswer}>
                    {showMessage && (
                        <Alert
                            style={{ backgroundColor: 'green', color: 'white', fontSize: '15px', border: 'none' }}
                            className="animate__animated animate__bounceOutUp animate__delay-1s"
                            message={message}
                            type="success"
                        />
                    )}
                    {showMessage2 && (
                        <Alert
                            style={{ backgroundColor: 'red', color: 'white', fontSize: '15px', border: 'none' }}
                            className="animate__animated animate__bounceOutUp animate__delay-1s"
                            message={message}
                            type="error"
                        />
                    )}
                </div>
                <div className={styles.navigateFooter}>
                    {console.log(1111,percentQuiz)}
                    <div className={styles.quit}>
                        <button onClick={AgainQuiz}>
                            <UndoOutlined style={{ fontSize: '25px', color: '#333' }} />
                        </button>
                    </div>
                    <div className={styles.NumberQuestion}  style={{ '--beforeWidth': `${percentQuiz}%` }}>
                        <div style={{textAlign: 'center', color: 'white', zIndex: '99'}}>{count1}/{count2}</div>
                    </div>
                    <div className={styles.next}>
                        <button onClick={handleNextQuestion}>
                            <CaretRightOutlined style={{ fontSize: '25px', color: '#333' }} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function shuffleArray(array) {
    const shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
}
