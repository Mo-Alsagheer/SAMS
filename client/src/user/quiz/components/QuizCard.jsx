import React from "react";

function QuizCard({ id, question, options, onSelect, selectedOption }) {
  return (
    <fieldset className="space-y-4">
      {/* question */}
      <legend className="text-xl md:text-2xl font-bold mb-6 text-slate-900 italic uppercase tracking-tighter">
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
                relative rounded-xl p-4 cursor-pointer transition-all duration-300 border-2 text-md font-medium
                ${
                  isSelected
                    ? "bg-blue-50 border-blue-800 text-blue-900 shadow-md"
                    : "bg-white hover:bg-slate-50 border-slate-100 text-slate-600 hover:border-blue-200"
                }
              `}
            >
              <input
                type="radio"
                name={`question-${id}`}
                value={option.id}
                checked={isSelected}
                onChange={() => onSelect(option.id)}
                className="hidden"
              />
              
              <div className="flex items-center gap-3">
                
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  isSelected ? "border-blue-800 bg-blue-800" : "border-slate-300"
                }`}>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                
                <span>{option.text}</span>
              </div>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export default React.memo(QuizCard);