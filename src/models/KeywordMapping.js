export default class KeywordMapping {
  constructor(topic, topicKeywords) {
    this.topic = topic;
    this.includeWords = topicKeywords.filter(word => word[0] !== '-');
    this.banWords = topicKeywords
      .filter(word => word[0] === '-')
      .map(word => word.replace('-', ''));
    
    this.includeRegExps = this.includeWords.map(word => new RegExp(word, 'i'));
    this.banRegExps = this.banWords.map(word => new RegExp(word, 'i'));
  }

  validateMessage(message) {
    const containsAllKeywords = this.includeRegExps.every(re => re.test(message));
    const containsSomeBanWords = this.banRegExps.some(re => re.test(message));
    
    return containsAllKeywords && !containsSomeBanWords;
  }

  toJSON() {
    return {
      includeWords: this.includeWords,
      banWords: this.banWords
    };
  }
}