import React, { useEffect, useState } from "react";
import { getDatabase, ref, child, get } from "firebase/database";
import { database } from "../../firebase";
import { Alert } from 'antd';

export default function Objectquiz() {
    const [data, setData] = useState({});
    const [load, setLoad] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [correctAnswer, setCorrectAnswer] = useState("");
    const [start, setStart] = useState(false);
    const [count1, setCount1] = useState(1);
    const [count2, setCount2] = useState(0);
    const [shuffledQuizData, setShuffledQuizData] = useState({});
    const [showMessage, setShowMessage] = useState(false);
    const [message, setMessage] = useState("");

    const dbRef = ref(database);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const snapshot = await get(child(dbRef, `Vocabulary`));
                if (snapshot.exists()) {
                    setData(snapshot.val());
                    setCount2(Object.keys(snapshot.val()).length);
                    console.log("data", snapshot.val());
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
        // Đảo câu hỏi chỉ khi data đã được fetch và không còn loading
        if (!load && Object.keys(data).length > 0) {
            const questionKeys = Object.keys(data);
            const shuffledQuestionKeys = shuffleArray(questionKeys);

            // Tạo một đối tượng mới sắp xếp lại theo thứ tự ngẫu nhiên
            const newShuffledQuizData = {};
            shuffledQuestionKeys.forEach((key, index) => {
                newShuffledQuizData[`c${index + 1}`] = data[key];
            });
            console.log("đối tượng sau khi đảo: ", newShuffledQuizData);

            setShuffledQuizData(newShuffledQuizData);

            // Lấy câu hỏi và đáp án cho câu hỏi đầu tiên
            setQuestionAndAnswers(newShuffledQuizData, 0);
        }
    }, [load, data]); // Chỉ chạy khi load hoặc data thay đổi

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
    };

    const handleNextQuestion = () => {
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

            // Tạo một đối tượng mới sắp xếp lại theo thứ tự ngẫu nhiên
            const newShuffledQuizData = {};
            shuffledQuestionKeys.forEach((key, index) => {
                newShuffledQuizData[`c${index + 1}`] = data[key];
            });
            console.log("đối tượng sau khi đảo: ", newShuffledQuizData);

            setShuffledQuizData(newShuffledQuizData);

            // Lấy câu hỏi và đáp án cho câu hỏi đầu tiên
            setQuestionAndAnswers(newShuffledQuizData, 0);
            return;
        }

        setQuestionAndAnswers(shuffledQuizData, currentQuestionIndex + 1);
        setCount1(count1 + 1);
    };

    const ButtonStart = () => {
        setStart(true);
        setQuestionAndAnswers(shuffledQuizData, 0);
    };

    const AgainQuiz = () => {
        setCount1(1);
        setCurrentQuestionIndex(0);
        setStart(false);
        const questionKeys = Object.keys(data);
        const shuffledQuestionKeys = shuffleArray(questionKeys);

        // Tạo một đối tượng mới sắp xếp lại theo thứ tự ngẫu nhiên
        const newShuffledQuizData = {};
        shuffledQuestionKeys.forEach((key, index) => {
            newShuffledQuizData[`c${index + 1}`] = data[key];
        });
        console.log("đối tượng sau khi đảo: ", newShuffledQuizData);

        setShuffledQuizData(newShuffledQuizData);

        // Lấy câu hỏi và đáp án cho câu hỏi đầu tiên
        setQuestionAndAnswers(newShuffledQuizData, 0);
    }

    const checkAnswer = (selectedAnswer) => {
        if (selectedAnswer === correctAnswer) {
            setMessage("Chính xác!");
            handleNextQuestion();
        } else {
            setMessage("Sai rồi. Hãy thử lại!");
        }
        setShowMessage(true);

        // Tự động ẩn thông báo sau 2 giây
        setTimeout(() => {
            setShowMessage(false);
            setMessage("");
        }, 2000);
    };

    if (load || !data || Object.keys(data).length === 0) {
        return <div>Đang tải...</div>;
    }

    if (!start) {
        return <button onClick={ButtonStart}>Bắt đầu</button>;
    }

    const { question } = shuffledQuizData[`c${currentQuestionIndex + 1}`];

    return (
        <div>
            <div key={`question-${currentQuestionIndex}`}>
                Câu hỏi số {currentQuestionIndex + 1}: {question}
            </div>
            {answers.map((answer, index) => (
                <button key={index} onClick={() => checkAnswer(answer)}>
                    {String.fromCharCode(65 + index)}. {answer}
                </button>
            ))}
            {showMessage && <Alert message={message} type="success" />}
            <div>
                <button onClick={handleNextQuestion}>Tiếp theo</button>
            </div>
            <div>
                <button onClick={AgainQuiz}>Làm lại</button>
            </div>
        </div>
    );
}

// Hàm xáo trộn mảng theo thứ tự ngẫu nhiên
function shuffleArray(array) {
    const shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
}
