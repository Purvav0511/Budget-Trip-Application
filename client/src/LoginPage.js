import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

const LoginPage = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [errors, setErrors] = useState({ name: "", email: "" });
    const navigate = useNavigate();

    const validateName = (name) => {
        const nameRegex = /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/;
        return nameRegex.test(name);
    };

    const validateEmail = (email) => {
        const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
        return emailRegex.test(email);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate name and email
        let nameError = "";
        let emailError = "";

        if (!validateName(name)) {
            nameError = "Please enter a valid name.";
        }

        if (!validateEmail(email)) {
            emailError = "Please enter a valid email address.";
        }

        if (nameError || emailError) {
            setErrors({ name: nameError, email: emailError });
            return;
        }
        const user = {
            name,
            email
        };

        return fetch(`http://localhost:8000/login`, {
                'method': 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(user)
            })
            .then(response => response.json())
            .then(navigate("/preferences", { state: { name, email } }))
            .catch(error => console.log(error))

    };

    const handleChange = (e) => {
        setName(e.target.value);
    };

    const style = {
        container: {
            background: "url('https://images.pexels.com/photos/1051075/pexels-photo-1051075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2') no-repeat center center fixed",
            backgroundSize: "cover",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "'Roboto', sans-serif",
        },
        form: {
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            padding: "30px",
            borderRadius: "10px",
            width: "400px",
            maxWidth: "100%",
            textAlign: "center",
        },
        title: {
            color: "#3a3a3a",
            marginBottom: "20px",
        },
        label: {
            display: "block",
            marginBottom: "5px",
        },
        input: {
            width: "100%",
            padding: "8px",
            marginBottom: "20px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            fontSize: "14px",
            fontFamily: "inherit",
        },
        button: {
            width: "100%",
            padding: "10px",
            borderRadius: "4px",
            backgroundColor: "#66bb6a",
            border: "none",
            color: "white",
            fontSize: "16px",
            cursor: "pointer",
        },
        links: {
            marginTop: "20px",
            fontSize: "12px",
        },
        link: {
            color: "#3a3a3a",
            textDecoration: "none",
        },
    };

    useEffect(() => {
        fetch("/members").then(
            res => res.json()
        ).then(
            data => {
                //setData(data)
                console.log(data)
            }
        )
    }, [])

    return ( 
      <> < div style = { style.container } >
        <form onSubmit = { handleSubmit }
        style = { style.form } >
        <h1 style = { style.title } > Budget Trip App </h1> 
        <label htmlFor = "name"
        style = { style.label } >
        Name:
        </label>
        <input id = "name"
        type = "text"
        value = { name }
        required = 'true'
        onChange = { handleChange }
        style = { style.input } />
        {errors.name && <div style={{color: 'red', position : "relative", padding : "2%", marginTop: "-10px", marginBottom: "10px"}}>{errors.name}</div>}
        <label htmlFor = "email"
        style = { style.label } >
        Email:
        </label> 
        <input id = "email"
        type = "email"
        value = { email }
        required = 'true'
        onChange = {
            (e) => setEmail(e.target.value) }
        style = { style.input }/> 
        {errors.email && <div style={{color: 'red', position : "relative", padding : "2%", marginTop: "-10px"}}>{errors.email}</div>}
        <button type = "submit"
        style = { style.button } >
        Step 1 / 4
        </button>
        </form>
        </div><input
        id = "name"
        type = "text"
        value = { name }
        onChange = { handleChange }
        style = { style.input } />
        <label htmlFor="email" style={style.label}>
        Email:
        </label><input
        id = "email"
        type = "email"
        value = { email }
        onChange = {
            (e) => setEmail(e.target.value) }
        style = { style.input }
        /><button type="submit" style={style.button}>
        Step 1 / 4 </button>
        </ >
        
    );

};

export default LoginPage;