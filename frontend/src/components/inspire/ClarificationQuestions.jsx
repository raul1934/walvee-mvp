import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const ClarificationQuestions = ({ questions, onSubmitAnswers }) => {
  const [answers, setAnswers] = useState({});

  const handleOptionSelect = (questionId, optionValue) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionValue,
    }));
  };

  const handleSubmit = () => {
    // Convert answers to follow-up message
    const answersText = questions
      .map((q) => {
        const answer = answers[q.question_id];
        const option = q.options.find((o) => o.value === answer);
        return `${q.question_text} ${option?.label || answer}`;
      })
      .join(". ");

    onSubmitAnswers(answersText);
  };

  const allQuestionsAnswered = questions.every(
    (q) => answers[q.question_id]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-6 my-4"
    >
      <div className="flex items-center gap-3 mb-4">
        <HelpCircle className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-bold text-gray-900">
          I need some clarification
        </h3>
      </div>

      <div className="mb-4 text-sm text-gray-600">
        Please answer the following questions to help me better understand your request
      </div>

      <AnimatePresence mode="popLayout">
        <div className="space-y-6 mb-6">
          {questions.map((question, qIndex) => {
            const isAnswered = !!answers[question.question_id];

            return (
              <motion.div
                key={question.question_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: qIndex * 0.1 }}
                className="space-y-3"
              >
                <h4 className="font-semibold text-gray-900 text-base flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-bold">
                    {qIndex + 1}
                  </span>
                  {question.question_text}
                </h4>

                <div className="grid grid-cols-1 gap-2 pl-8">
                  {question.options.map((option, oIndex) => {
                    const isSelected =
                      answers[question.question_id] === option.value;

                    return (
                      <motion.button
                        key={option.option_id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: qIndex * 0.1 + oIndex * 0.05 }}
                        onClick={() =>
                          handleOptionSelect(question.question_id, option.value)
                        }
                        className={`
                          relative p-4 rounded-xl border-2 text-left transition-all duration-200
                          ${
                            isSelected
                              ? "border-blue-500 bg-blue-50 shadow-md"
                              : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/30"
                          }
                        `}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`
                            flex-shrink-0 w-5 h-5 rounded-full border-2 mt-0.5 transition-all
                            ${
                              isSelected
                                ? "border-blue-600 bg-blue-600"
                                : "border-gray-300"
                            }
                          `}
                          >
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="flex items-center justify-center h-full"
                              >
                                <Check className="w-3 h-3 text-white" />
                              </motion.div>
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="font-medium text-gray-900 mb-1">
                              {option.label}
                            </div>
                            {option.description && (
                              <div className="text-sm text-gray-600">
                                {option.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {isAnswered && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 text-sm text-green-600 font-medium pl-8"
                  >
                    <Check className="w-4 h-4" />
                    <span>Answered</span>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </AnimatePresence>

      <div className="pt-4 border-t border-gray-200">
        <Button
          onClick={handleSubmit}
          disabled={!allQuestionsAnswered}
          className={`
            w-full font-medium py-3 rounded-xl transition-all duration-200
            flex items-center justify-center gap-2
            ${
              allQuestionsAnswered
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }
          `}
        >
          <span>Submit Answers</span>
          {allQuestionsAnswered && (
            <ChevronRight className="w-5 h-5" />
          )}
        </Button>

        {!allQuestionsAnswered && (
          <div className="mt-3 text-center text-sm text-gray-500">
            Please answer all questions to continue
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ClarificationQuestions;
