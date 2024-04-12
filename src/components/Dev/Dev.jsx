import React, { useEffect, useState } from 'react';
import { ref, child, get } from 'firebase/database';
import { database } from '../../firebase';

const Dev = () => {
    const [vocabularyLengths, setVocabularyLengths] = useState({});

    useEffect(() => {
        const fetchVocabularyLengths = async () => {
            const dbRef = ref(database);
            const snapshot = await get(dbRef); // Lấy snapshot của nút gốc
            
            if (snapshot.exists()) {
                const vocabularyPaths = Object.keys(snapshot.val());
                
                const lengths = {};

                for (const path of vocabularyPaths) {
                    const vocabularyRef = child(ref(database), `${path}/Vocabulary`);
                    console.log(1111, `${path}/Vocabulary`);
                    try {
                        const vocabularySnapshot = await get(vocabularyRef);
                        if (vocabularySnapshot.exists()) {
                            lengths[path] = Object.keys(vocabularySnapshot.val()).length
                        } else {
                            lengths[path] = 0;
                        }
                    } catch (error) {
                        console.error(`Lỗi khi lấy độ dài của ${path}:`, error);
                        lengths[path] = 0;
                    }
                }

                setVocabularyLengths(lengths); // Cập nhật state với các độ dài của các Vocabulary
            }
        };

        fetchVocabularyLengths();
    }, []);

    return (
        <div>
            <h2>Chiều dài của từng Vocabulary:</h2>
            <ul>
                {Object.keys(vocabularyLengths).map((vocabularyName) => (
                    <li key={vocabularyName}>
                        {vocabularyName}: {vocabularyLengths[vocabularyName]}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Dev;
