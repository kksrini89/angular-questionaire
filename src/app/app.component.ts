import { AfterViewInit, Component, VERSION } from '@angular/core';
import {
  ACTIVE_ATTR,
  QUIZ_ATTR,
  QUESTION_ATTR,
  ANSWER_ATTR,
  MULTIPLE_ID_ATTR,
  MULTIPLE_ATTR,
  PREV_ATTR,
  FORK_ATTR,
  FORK_BTN_ATTR,
  NEXT_ATTR,
  RESULTS_ATTR,
  RESULTS_DISPLAY_ATTR,
  RESTART_ATTR,
  RETURN_ATTR,
} from './quiz-constants';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  name = 'Angular ' + VERSION.major;

  public answers = {};

  setActive(card) {
    card.setAttribute(ACTIVE_ATTR, 'true');
    card.setAttribute('tabindex', '0');
  }

  setInactive(card) {
    card.setAttribute(ACTIVE_ATTR, 'false');
    card.setAttribute('tabindex', '-1');
  }

  registerAnswer(question, answer) {
    this.answers[question] = answer;
  }

  prevQuestion(current, prev) {
    current.setAttribute(PREV_ATTR, '0');
    this.setInactive(current);
    this.setActive(prev);
    this.answers[current.getAttribute(QUESTION_ATTR)] = null;
    delete this.answers[current.getAttribute(QUESTION_ATTR)];
  }

  nextQuestion(current, next) {
    this.setInactive(current);
    if (!next) {
      return;
    }
    this.setActive(next);
    next.setAttribute(PREV_ATTR, current.getAttribute(QUESTION_ATTR));

    var nextFork = next.getAttribute(FORK_ATTR);
    if (!nextFork) {
      return;
    }
    var nextForkList = nextFork.split(';');
    for (var f = 0; f < nextForkList.length; f++) {
      var thisFork = nextForkList[f].split(':');
      if (thisFork[0] == current.getAttribute(PREV_ATTR)) {
        next
          .querySelector('[' + FORK_BTN_ATTR + ']')
          .setAttribute(ANSWER_ATTR, thisFork[1]);
      }
    }
  }

  quizReset(quizParent) {
    this.answers = {};
    this.nextQuestion(
      quizParent.querySelector('[' + RESULTS_ATTR + ']'),
      quizParent.querySelector('[' + QUESTION_ATTR + '="1"]')
    );
    var checkboxes = quizParent.querySelectorAll('input[type="checkbox"]');
    for (var c = 0; c < checkboxes.length; c++) {
      checkboxes[c].checked = false;
    }
  }

  quizAction(e) {
    const prevBtn = e.target.closest('[' + RETURN_ATTR + ']');
    const answerBtn = e.target.closest('[' + ANSWER_ATTR + ']');
    const currentCard = e.target.closest('[' + QUESTION_ATTR + ']');
    const resetBtn = e.target.closest('[' + RESTART_ATTR + ']');

    if (resetBtn) {
      this.quizReset(e.target.closest('[' + QUIZ_ATTR + ']'));
      return;
    }

    if (!answerBtn && !resetBtn && !prevBtn) {
      return;
    }

    if (prevBtn) {
      this.prevQuestion(
        prevBtn.closest('[' + QUESTION_ATTR + ']'),
        prevBtn
          .closest('[' + QUIZ_ATTR + ']')
          .querySelector(
            '[' +
              QUESTION_ATTR +
              "='" +
              currentCard.getAttribute(PREV_ATTR) +
              "']"
          )
      );

      return;
    }

    var currentQuestionId = parseInt(
      currentCard.getAttribute(QUESTION_ATTR),
      10
    );

    let isFinished: boolean = false;
    let answerEntity = {};
    let checkedAnswer: boolean = false;
    if (answerBtn.getAttribute(ANSWER_ATTR) === 'multiple') {
      var answerObject = {};
      var answerGroup = currentCard.querySelectorAll(
        '[' +
          MULTIPLE_ATTR +
          '="' +
          answerBtn.getAttribute(MULTIPLE_ID_ATTR) +
          '"]'
      );
      for (var a = 0; a < answerGroup.length; a++) {
        answerObject[answerGroup[a].name] = answerGroup[a].checked;
      }
      answerEntity = answerObject;
      isFinished = false;
    } else {
      checkedAnswer =
        parseInt(answerBtn.getAttribute(ANSWER_ATTR), 10) === 1 ? true : false; // Yes == 1 == true / No == 0 == false
      isFinished = true;
    }

    var nextQuestionId = answerBtn.getAttribute(NEXT_ATTR);
    var nextCard = currentCard
      .closest('[' + QUIZ_ATTR + ']')
      .querySelector(
        '[' +
          (nextQuestionId === 'results'
            ? RESULTS_ATTR
            : QUESTION_ATTR + '="' + parseInt(nextQuestionId, 10) + '"') +
          ']'
      );
    this.registerAnswer(
      currentQuestionId,
      isFinished ? checkedAnswer : answerEntity
    );
    if (nextQuestionId === 'results') {
      nextCard.querySelector('[' + RESULTS_DISPLAY_ATTR + ']').innerHTML =
        '<pre style="text-align:left;">' +
        JSON.stringify(this.answers, null, 2) +
        '</pre>';
    }
    this.nextQuestion(currentCard, nextCard);
  }

  init() {
    const that = this;
    document.addEventListener('click', function (e) {
      that.quizAction(e);
      console.log(that.answers);
    });
  }

  ngAfterViewInit(): void {
    this.init();
  }
}
