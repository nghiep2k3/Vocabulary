import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate,  } from 'react-router-dom';
import { Alert, Spin } from 'antd';
import { CaretRightOutlined, UndoOutlined } from '@ant-design/icons';
import { database } from "../../firebase";
import 'animate.css';
import styles from "./objectquiz.module.css";
import correctQuiz from "../../assets/Dung.mp3";
import wrongQuiz from "../../assets/Sai.mp3";
import link from '../../assets/fakelove.mp3';
import link2 from '../../assets/Lanterns.mp3';
import link3 from '../../assets/Monody.mp3';
import { child, get, ref, set } from "firebase/database";
import { useAudioContext } from '../../AudioContext';
export default function Objectquiz() {
    const { quiz } = useParams();
    const navigate = useNavigate();
    const { isPlaying } = useAudioContext();
    const [data, setData] = useState({});
    const [load, setLoad] = useState(true);
    const [percentQuiz, setPercentQuiz] = useState(0);
    const [Chargewidth, setChargeWidth] = useState(0.0);
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
    const [linkSrc, setLinkSrc] = useState([link, link2, link3]);
    const [correctAudioSrc, setCorrectAudioSrc] = useState(correctQuiz);
    const [wrongAudioSrc, setWrongAudioSrc] = useState(wrongQuiz);
    const colors = ['#00DD00', 'orange', '#FF3300', 'black', '#FF99CC', '#996600', '#708090', '#8B8989', 'black', '#FF99CC', '#00DD00', 'orange', '#708090', 'orange', '#FF3300', 'black'];
    const [colorIndex, setColorIndex] = useState(0);
    const [questionTrue, setQuestionTrue] = useState(0);
    const [questionFalse, setQuestionFalse] = useState(0);
    const [questionUndefine, setQuestionUndefine] = useState(0);
    const [currentSrcIndex, setCurrentSrcIndex] = useState(0);
    const [spinning, setSpinning] = useState(false);
    const audioRef = useRef(null);
    const correctAudioRef = useRef(null);
    const wrongAudioRef = useRef(null);

    const dbRef = ref(database);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const snapshot = await get(child(dbRef, `${quiz}/Vocabulary`));
                if (snapshot.exists()) {
                    setData(snapshot.val());
                    setCount2(Object.keys(snapshot.val()).length);
                    setPercentQuiz(100 / Object.keys(snapshot.val()).length);
                    setChargeWidth(parseFloat(100 / Object.keys(snapshot.val()).length / 2));
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

    useEffect(() => {
        const getRandomIndex = () => {
            return Math.floor(Math.random() * linkSrc.length);
        };

        const newIndex = getRandomIndex();
        setCurrentSrcIndex(newIndex);
    }, [linkSrc]);

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


    const handleNextQuestion = async () => {
        setAnimate('animate__animated animate__backOutDown');

        if (!start) {
            setStart(true);
        }

        if (count1 === count2) {
            localStorage.setItem('True', questionTrue);
            localStorage.setItem('False', questionFalse);
            // alert("Đã hết câu hỏi...");
            setCount1(1);
            setQuestionTrue(0);
            setQuestionFalse(0);
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
            localStorage.setItem('True', questionTrue);
            localStorage.setItem('False', questionFalse);
            localStorage.setItem('questionUndefine', questionUndefine);
            navigate('/Result', {
                state: { questionTrue, questionFalse }
            });
            // await setTimeout(() => {
            //     navigate("/Result");
            // }, 2000);
            return;
        }
        setPercentQuiz(prevWidth => prevWidth + Chargewidth);
        setQuestionUndefine(questionUndefine + 1);
        setTimeout(() => {
            setQuestionAndAnswers(shuffledQuizData, currentQuestionIndex + 1);
            setCount1(count1 + 1);
            setAnimate('animate__animated animate__bounceInDown');
            setColorIndex(colorIndex + answers.length);
        }, 1000);

        console.log(questionTrue, questionFalse);
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
        // SetPlayMusic(true);
        setQuestionAndAnswers(shuffledQuizData, 0);
        setAnimate('animate__animated animate__backInLeft');
        setTimeout(() => setAnimate(''), 1000);
    };

    const playAudio = () => {
        const audioElement = audioRef.current;
        console.log(isPlaying);
        if (audioElement) {
            if (isPlaying) {
                audioElement.play().catch(error => {
                    console.error('Error playing audio:', error);
                });
            } else {
                audioElement.pause();
            }
            audioElement.volume = 0.7;
        }
    };

    const AgainQuiz = () => {
        setAnimate('');
        setQuestionTrue(0);
        setQuestionFalse(0);
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
            setShowMessage(true);
            setTimeout(() => {
                setPercentQuiz(percentQuiz + Chargewidth);
                setQuestionTrue(prev => prev + 1);
                console.log(22222,questionTrue);
                handleNextQuestion();
            }, 1700);

            // Phát âm thanh đúng
            correctAudioRef.current.src = correctQuiz;
            correctAudioRef.current.play();
            correctAudioRef.current.volume = 1;
        } else {
            setMessage("Sai rồi. Hãy thử lại!");
            setShowMessage2(true);
            setTimeout(() => {
                setPercentQuiz(percentQuiz + Chargewidth);
                setQuestionFalse(questionFalse + 1);
                handleNextQuestion();
            }, 1700);
            wrongAudioRef.current.src = wrongQuiz;
            wrongAudioRef.current.play();
            wrongAudioRef.current.volume = 1;

        }

        setTimeout(() => {
            setShowMessage(false);
            setShowMessage2(false);
            setMessage("");
        }, 1700);
    };

    const showLoader = () => {
        setSpinning(true);
        setTimeout(() => {
            navigate("/Result");
            setSpinning(false);
        }, 3000);
    }


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
            {console.log(questionTrue)}
            {/* <button onClick={showLoader}>Show fullscreen for 3s</button> */}
            <div style={{ display: 'none' }}>
                <audio loop src={linkSrc[currentSrcIndex]} ref={audioRef} controls>
                </audio>
            </div>

            <div style={{ display: 'none' }}>
                <audio ref={correctAudioRef}></audio>
            </div>


            <div style={{ display: 'none' }}>
                <audio ref={wrongAudioRef}></audio>
            </div>
            <div style={{ width: '100%' }}>
                <div key={`question-${currentQuestionIndex}`}>
                    <p className={`${styles.quiz} ${animate}`}><span className={styles.firstLetter}>{question}</span></p>
                    {/* <button onClick={Kq}>Kết quả</button> */}
                    {/* <p>{questionTrue} - {questionFalse}</p> */}
                </div>
                <div className={styles.allQuiz}>
                    {answers.map((answer, index) => (
                        <div
                            key={index}
                            className={`${styles.answer} ${animate}`}
                            onClick={() => checkAnswer(answer)}
                            style={{ backgroundColor: colors[(colorIndex + index) % colors.length] }}
                        >
                            <span>{String.fromCharCode(65 + index)}. <span className={styles.firstLetter}>{answer}</span></span>
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
                    {console.log(1111, percentQuiz, Chargewidth)}
                    <div className={styles.quit}>
                        <button onClick={AgainQuiz}>
                            <UndoOutlined style={{ fontSize: '25px', color: '#333' }} />
                        </button>
                    </div>
                    <div className={styles.NumberQuestion} style={{ '--beforeWidth': `${percentQuiz}%` }}>
                        <div style={{ textAlign: 'center', color: 'white', zIndex: '99' }}>{count1}/{count2}</div>
                    </div>
                    <div className={styles.next}>
                        <button onClick={handleNextQuestion}>
                            <CaretRightOutlined style={{ fontSize: '25px', color: '#333' }} />
                        </button>
                    </div>
                </div>
            </div>

            {/* <Spin spinning={spinning} fullscreen /> */}
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
