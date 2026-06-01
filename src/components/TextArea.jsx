import React from "react";

const TextArea = (props) => {
  return (
    <div className={props.className}>
      <label>{props.label}</label>
      <textarea className={props.className} placeholder={props.placeholder} />
    </div>
  );
};

export default TextArea;
