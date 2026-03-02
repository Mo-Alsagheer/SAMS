import React from "react";

function QuizCard({ id, question, options, onSelect, selectedOption }) {
  return (
    <fieldset className="space-y-4">
      {/* question */}
      <legend className="text-xl md:text-2xl font-semibold mb-4">
        Q {id} : {question}
      </legend>

      {/* options */}
      <div className="flex flex-col gap-3">
        {options.map((option) => {
          const isSelected = selectedOption === option.id;

          return (
            <label
              key={option.id}
              className={`
                rounded-lg p-3 cursor-pointer transition border text-md font-normal
                ${
                  isSelected
                    ? "bg-sky-300 border-sky-500"
                    : "bg-sky-100 hover:bg-sky-200 border-transparent"
                }
              `}
            >
              <input
                type="radio"
                name={`question-${id}`}
                value={option.id}
                checked={isSelected}
                onChange={() => onSelect(option.id)}
                className="hidden "
              />

              {option.text}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export default React.memo(QuizCard);
