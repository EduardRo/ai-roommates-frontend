/**
 * Tutor Message Generator
 * Provides contextual, engaging messages for the AI tutor based on lesson state
 */

/**
 * Get a random message from an array
 */
const getRandomMessage = (messages) => {
  return messages[Math.floor(Math.random() * messages.length)]
}

/**
 * Get welcome message for starting a lesson
 */
export const getWelcomeMessage = (lessonTitle) => {
  const messages = [
    `Hey! Ready to explore ${lessonTitle}? Let's make this fun! 🚀`,
    `Welcome! ${lessonTitle} is going to be awesome. Let's dive in! 🌟`,
    `Hi there! Time to learn ${lessonTitle}. I'll be here to help! 💪`,
    `Yay! Let's discover ${lessonTitle} together. You've got this! ✨`,
  ]
  return getRandomMessage(messages)
}

/**
 * Get message for starting theory phase
 */
export const getTheoryStartMessage = () => {
  const messages = [
    "Let's learn some cool stuff! Pay attention, this is important! 📚",
    "Theory time! Don't worry, I'll make it fun! 🎓",
    'Ready to learn? This part will help you ace the practice! 💡',
  ]
  return getRandomMessage(messages)
}

/**
 * Get message for starting practice phase
 */
export const getPracticeStartMessage = () => {
  const messages = [
    'Time to practice! Show me what you learned! 💪',
    "Practice makes perfect! Let's see what you can do! ⭐",
    "You've got this! Let's put your knowledge to the test! 🎯",
    'Challenge time! Remember what we learned! 🚀',
  ]
  return getRandomMessage(messages)
}

/**
 * Get celebration message for correct answer
 */
export const getCorrectAnswerMessage = () => {
  const messages = [
    "YES! That's correct! You're a math superstar! ⭐",
    'Woohoo! Perfect answer! Keep it up! 🎉',
    'Amazing! You nailed it! 🌟',
    "Brilliant! You're on fire! 🔥",
    "That's right! You're doing great! 💯",
    'Excellent work! I knew you could do it! 🎊',
  ]
  return getRandomMessage(messages)
}

/**
 * Get encouragement message for wrong answer
 */
export const getWrongAnswerMessage = () => {
  const messages = [
    "Oops! Not quite, but that's okay! Try again! 💪",
    "Almost! Don't give up, you can figure it out! 🌟",
    'Not this time, but I believe in you! Give it another shot! ✨',
    "That's not it, but mistakes help us learn! Try once more! 📚",
    'Nice try! Take your time and think it through! 🤔',
  ]
  return getRandomMessage(messages)
}

/**
 * Get milestone message (halfway through practice)
 */
export const getMilestoneMessage = () => {
  const messages = [
    "Halfway there! You're doing amazing! Keep going! 🎯",
    "Look at you go! You're crushing it! 💪",
    "Great progress! You're almost there! 🌟",
  ]
  return getRandomMessage(messages)
}

/**
 * Get message for last question
 */
export const getLastQuestionMessage = () => {
  const messages = [
    "Final question! Finish strong! You've got this! 🏁",
    "Last one! Show me what you've learned! ⭐",
    "Almost done! One more and you're finished! 🎉",
  ]
  return getRandomMessage(messages)
}

/**
 * Get completion message based on score
 */
export const getCompletionMessage = (score) => {
  if (score >= 9) {
    return "🌟 INCREDIBLE! Perfect score! You're a math genius! 🏆"
  } else if (score >= 7) {
    return 'Amazing work! You did great! Keep up the fantastic effort! 🎉'
  } else if (score >= 5) {
    return "Good job! You're learning well! Practice makes perfect! 💪"
  } else {
    return "Nice try! Don't worry, you'll do better next time! Keep practicing! ✨"
  }
}

/**
 * Get hint message (when student clicks on tutor)
 */
export const getHintMessage = () => {
  const messages = [
    '💡 Hint: Read the question carefully and think step by step!',
    '💡 Hint: Remember what we just learned in the theory section!',
    "💡 Hint: Take your time. There's no rush!",
    "💡 Hint: Try eliminating answers that don't make sense first!",
  ]
  return getRandomMessage(messages)
}

/**
 * Get idle message (when nothing is happening)
 */
export const getIdleMessage = () => {
  const messages = [
    "I'm here if you need help! Click on me for a hint! 💡",
    "Take your time! I'm not going anywhere! 😊",
    "You're doing great! Keep going! ⭐",
  ]
  return getRandomMessage(messages)
}
