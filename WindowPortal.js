import { useState, useRef, useEffect } from 'react'
import ReactDOM from "react-dom";


export default function WindowPortal(props) {
    const [container, setContainer] = useState(null);
    const newWindow = useRef(null);


    function copyStyles(src, dest) {
        Array.from(src.styleSheets).forEach(styleSheet => {
            dest.head.appendChild(styleSheet.ownerNode.cloneNode(true))
        })
        Array.from(src.fonts).forEach(font => dest.fonts.add(font))
    }


    useEffect(() => {
        setContainer(document.createElement("div"));
    }, []);

    useEffect(() => {
        if (container) {
            newWindow.current = window.open(
                "",
                "",
                "width=800,height=600,left=200,top=200"
            );
            newWindow.current.document.body.appendChild(container);

            copyStyles(window.document, newWindow.current.document);
        }
    }, [container]);

    return container && ReactDOM.createPortal(props.children, container);
}
