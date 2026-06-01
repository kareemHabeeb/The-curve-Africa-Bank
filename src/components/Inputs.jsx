import React from "react";

const Inputs = (props) => {
  return (
    <div className={props.className}>
      <label>{props.label}</label>
      <input
        type={props.type}
        placeholder={props.placeholder}
        onChange={props.onChange}
      />
    </div>
  );
};

export default Inputs;
