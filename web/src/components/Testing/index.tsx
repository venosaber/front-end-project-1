import {useReducer} from 'react'
import type {ChangeEvent} from "react";
import './style.css';
import type {Question} from '../../utils/types'
import {reducer, initState} from "../ExamDetail/teacherReducer.ts";

function App() {

  const [state, dispatch] = useReducer(reducer, initState);
  const {number_of_question, questions} = state;

  const onAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const payload: number = Number(e.target.value);
    dispatch({type: 'SET_AMOUNT', payload: payload});
  }
  console.log(state.questions);

  return (
      <>
        <input type={'number'} name={'amount'} value={number_of_question} onChange={onAmountChange}
               min={1} max={100}
        />

        {
          questions.map((question: Question) =>
              (
                  QuestionUnit(question)
              ))
        }
      </>
  )


  function QuestionElement(question: Question) {
    const onChangeAnswer = (e: ChangeEvent<HTMLInputElement>) => {
      const payload = {
        targetedAnswer: e.target.value,
        index: question.index
      }

      if(question.type === 'single-choice'){
        dispatch({type: 'SINGLE_CHANGE_CORRECT_ANSWER', payload: payload});
      }
      if(question.type === 'multiple-choice'){
        if(e.target.checked){
          dispatch({type: 'MULTIPLE_CHECK_OPTION', payload: payload})
        }else{
          dispatch({type: 'MULTIPLE_UNCHECK_OPTION', payload: payload})
        }
      }
    }

    const options: string[] = ["A", "B", "C", "D"];

    switch (question.type) {
      case 'single-choice':
        return options.map((option: string, index: number) => {
          return (
            <div key={index}>
              <input type={'radio'} name={`question-${question.index}`}
                     onChange={onChangeAnswer}
                     checked={question.correct_answer === option}
                     id={`question-${question.index}-${option}`} value={option}/>
              <label htmlFor={`question-${question.index}-${option}`}>{option}</label>
            </div>
          )
        });

      case 'multiple-choice':
        return options.map((option: string, index: number) => {
          return (
            <div key={index}>
              <input type={'checkbox'} name={`question-${question.index}`}
                     onChange={onChangeAnswer}
                     checked={question.correct_answer.includes(option)}
                     id={`question-${question.index}-${option}`} value={option}/>
              <label htmlFor={`question-${question.index}-${option}`}>{option}</label>
            </div>
          )
        });

      case 'long-response':
        return <input type={'text'} value={'Học sinh tự điền'} disabled/>;

      default:
        return <></>
    }
  }

  function QuestionUnit(question: Question) {
    const onChangeType = (e: ChangeEvent<HTMLSelectElement>) => {
      const questionType: string = e.target.value;
      const payload = {
        questionType: questionType,
        index: question.index
      }
      dispatch({type: 'CHANGE_QUESTION_TYPE', payload: payload});

    };

    return (
      <div key={question.index} style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
        <span>Câu {question.index +1}: </span>
        <select name={'questionType'} onChange={onChangeType}>
          <option value={'single-choice'}>Một đáp án</option>
          <option value={'multiple-choice'}>Nhiều đáp án</option>
          <option value={'long-response'}>Tự luận</option>
        </select>

        {
          QuestionElement(question)
        }

      </div>
    )
  }

}

export default App
