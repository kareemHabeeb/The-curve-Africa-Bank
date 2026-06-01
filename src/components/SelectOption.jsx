import React from "react";

const SelectOption = (props) => {
  return (
    <div className={props.className}>
      <label>{props.label}</label>
      <select>
        {props.optionData?.map((item, index) => (
          <option value={item} key={index}>
            {item}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectOption;
