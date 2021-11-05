import { useState, useEffect } from 'react';

export default function useFormField(formField, initialvalue = '') {
    const [value, setValue] = useState(initialvalue)
    const [error, setError] = useState(false)
    const [message, setmessage] = useState('Enter valid Data')

    const handleChange = (event) => {
        let { value } = event.target

        setValue(value)
        const validationResponse = formField.validator(value)

        var { status } = validationResponse

        setError(!status)
        setmessage(!status ? validationResponse.message : '')

    }

    const resetField = () => {
        setValue(initialvalue)
        setError(false)
        setmessage('')
    }

    useEffect(() => {
        handleChange({ target: { value: initialvalue } }, true)
    }, [initialvalue])

    const overwite = (value) => {
        handleChange({ target: { value } })
    }

    return { value, handleChange, error, message, setValue: overwite, resetField, initialvalue }
}
