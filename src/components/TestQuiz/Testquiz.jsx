import React, { useState } from 'react';
import { Button, Form, Input, message, Upload } from 'antd';
import { ref, get, child, set } from 'firebase/database';
import { v4 as uuidv4 } from 'uuid';
import { database } from '../../firebase';
import { UploadOutlined } from '@ant-design/icons';
import mammoth from 'mammoth';

export default function Testquiz() {
    const dbRef = ref(database);
    const [inputValue, setInputValue] = useState('');
    const [fileContent, setFileContent] = useState('');
    const [lesson, setLesson] = useState('Luyện Tập');

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const LessonName = (e) => {
        
        setLesson(e.target.value);
        console.log(lesson);
    };

    // Hàm xử lý khi chọn file
    const handleFileChange = (file) => {
        const fileReader = new FileReader();

        // Đọc file text (.txt)
        if (file.type === "text/plain") {
            fileReader.onload = (e) => {
                const content = e.target.result;
                setFileContent(content); // Lưu nội dung của file
            };
            fileReader.readAsText(file);
        }

        // Đọc file Word (.docx)
        else if (file.name.endsWith('.docx')) {
            fileReader.onload = async (e) => {
                const arrayBuffer = e.target.result;
                try {
                    const { value: text } = await mammoth.extractRawText({ arrayBuffer });
                    setFileContent(text); // Lưu nội dung của file Word
                } catch (error) {
                    message.error('Lỗi khi đọc file Word. Vui lòng thử lại!');
                }
            };
            fileReader.readAsArrayBuffer(file);
        }

        return false; // Ngăn không tải lên tự động
    };

    // Hàm xử lý và gửi dữ liệu từ file hoặc text area lên Firebase
    const handleSubmit = () => {
        if (!inputValue && !fileContent) {
            message.error('Vui lòng nhập dữ liệu hoặc chọn file!');
            return;
        }

        const data = inputValue || fileContent; // Lấy chuỗi từ textarea hoặc file
        console.log('Chuỗi đã nhập hoặc file:', data);

        handleAddMultipleWords(data); // Gọi hàm xử lý và lưu lên Firebase
    };

    const handleAddMultipleWords = async (data) => {
        const vocabularyRef = child(dbRef, `${lesson}/Vocabulary`);

        try {
            const vocabSnapshot = await get(vocabularyRef);
            const length = vocabSnapshot.exists() ? Object.keys(vocabSnapshot.val()).length : 0;

            const wordPairs = [];
            const inputData = data.trim().split('\n'); // Tách các dòng

            for (let i = 0; i < inputData.length; i += 2) {
                const question = inputData[i].split(':')[1]?.trim();
                const answer = inputData[i + 1].split(':')[1]?.trim();
                if (question && answer) {
                    wordPairs.push({ question, answer });
                }
            }

            let idCounter = length + 1;
            for (const pair of wordPairs) {
                const { question, answer } = pair;
                const randomUUID = uuidv4();

                const newWord = {
                    id: idCounter,
                    ref: randomUUID,
                    question: answer,
                    answer: question,
                };

                console.log(newWord);

                const newWordRef = child(vocabularyRef, `${randomUUID}`);
                await set(newWordRef, newWord);
                idCounter++;
            }

            message.success('Thêm các từ thành công!', 1.5);
            setInputValue('')
        } catch (error) {
            console.error('Lỗi khi thêm các từ mới:', error);
            message.error('Thêm từ thất bại. Vui lòng thử lại!', 1.5);
        }
    };

    
    return (
        <div style={{ padding: '20px' }}>
            <h2 style={{textAlign: 'center'}}>Điền chuỗi đầu vào hoặc chọn file</h2>
            <p style={{textAlign: 'center', margin: '10 0'}}>Nhập tên bài học muốn thêm hoặc tạo ra bài mới</p>
            <Input type="text" defaultValue={lesson} onChange={LessonName}/>
            <Form layout="vertical" style={{marginTop: 20}}>
                <Form.Item>
                    <Input.TextArea
                        rows={10}
                        cols={50}
                        value={inputValue}
                        onChange={handleInputChange}
                        placeholder="Nhập dữ liệu theo định dạng:
                            question: hello
                            answer: xin chào
                            question: number
                            answer: số"
                    />
                </Form.Item>
                <Form.Item label="Chọn file (txt hoặc docx)">
                    <Upload
                        beforeUpload={(file) => {
                            handleFileChange(file); // Xử lý file khi chọn
                            return false; // Ngăn không tải lên tự động
                        }}
                        accept=".txt,.docx"
                    >
                        <Button icon={<UploadOutlined />}>Chọn file</Button>
                    </Upload>
                </Form.Item>
                <Form.Item>
                    <Button type="primary" onClick={handleSubmit}>
                        Xử lý
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}
