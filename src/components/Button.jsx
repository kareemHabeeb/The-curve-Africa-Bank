import React from "react";
import "./css/ButtonStyle.css";

const Button = (props) => {
  return (
    <button className={`Btn ${props.className}`} onClick={props.onClick}>
      {props.text}
    </button>
  );
};

export default Button;
