import { useState } from 'react';

export default function useFileField(formField) {
    const [file, setFile] = useState()
    const [fileData, setfileData] = useState()
    const [error, setError] = useState(true)
    const [message, setmessage] = useState('Upload Valid File!!!')
    const filereader = new FileReader();

    const handleFileChange = (event) => {
        let file = event.target.files[0]

        const validationResponse = formField.validator(file)
        const { status } = validationResponse

        if (status && formField.requiredRawData) {

            filereader.readAsText(file);

            filereader.onload = () => {
                console.log(filereader.result);
                setfileData(filereader.result)
            };

            filereader.onerror = () => {
                console.log("Error: ", filereader.error);
                setfileData('')
            };

        }

        setError(!status)
        setFile(status && file)
        setmessage(!status ? validationResponse.message : '')
        !status && (event.target.value = null)

    }

    return { value: file, handleChange: handleFileChange, error, message, fileData }
}
