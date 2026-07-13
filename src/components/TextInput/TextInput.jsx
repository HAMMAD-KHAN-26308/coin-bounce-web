import Styles from "./TextInput.module.css";
function TextInput(props) {
  return (
    <div className={Styles.textInputWrapper}>
      <input {...props} />
      {props.error && (
        <p className={Styles.errorMessage}>{props.errormessage}</p>
      )}
    </div>
  );
}

export default TextInput;
