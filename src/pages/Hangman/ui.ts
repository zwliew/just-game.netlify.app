import { LitElement, html, property, TemplateResult } from 'lit-element';
import '@material/mwc-textfield';
import '@material/mwc-fab';
import '@material/mwc-dialog';
import { init, guess, WON, LOST, State } from './game.js';

function isInputValid(input: string) {
  const ALPHABETS = 'abcdefghijklmnopqrstuvwxyz';
  for (const c of ALPHABETS) {
    if (c === input) {
      return true;
    }
  }
  return false;
}

export class Hangman extends LitElement {
  // UI
  @property({ type: String }) curInput = '';

  // Game logic
  @property({ type: String }) curGuess: State['curGuess'] | undefined;
  @property({ type: String }) targetWord: State['targetWord'] | undefined;
  @property({ type: Number }) livesLeft: State['livesLeft'] | undefined;
  @property({ type: Number }) gameState: State['gameState'] | undefined;
  @property({ type: Object }) state: State | undefined;

  constructor() {
    super();

    this.restartGame();
  }

  async restartGame(): Promise<void> {
    this.curInput = '';
    this.updateState(await init());
  }

  updateState(state: State): void {
    this.curGuess = state.curGuess;
    this.livesLeft = state.livesLeft;
    this.targetWord = state.targetWord;
    this.gameState = state.gameState;
    this.state = state;
  }

  submitGuess(): void {
    if (isInputValid(this.curInput)) {
      this.updateState(guess(this.state!, this.curInput));
      this.curInput = '';
    }
  }

  updateInput({ data }: { data: string | null }): void {
    this.curInput = data === null ? '' : data;
  }

  handleKeyUp({ key }: KeyboardEvent): void {
    if (key === 'Enter') {
      this.submitGuess();
    }
  }

  render(): TemplateResult {
    const displayedGuess = Array.from(this.curGuess!).join(' ');
    let endDialog;
    if (this.gameState === WON || this.gameState === LOST) {
      endDialog = html`
        <mwc-dialog open @closed="${this.restartGame}">
          <p>
            ${this.gameState === WON
              ? '🎊 You won! 🎉'
              : 'You lost. Better luck next time!'}
          </p>
          <p>The word was "${this.targetWord}".</p>
          <mwc-button slot="primaryAction" dialogAction="restart">
            Restart
          </mwc-button>
        </mwc-dialog>
      `;
    }

    const lives = [html`Lives left: `];
    for (let i = 0; i < this.livesLeft!; i += 1) {
      lives.push(html`❤️`);
    }

    return html`
      <h1>Hangman</h1>
      ${endDialog}
      <h2>${displayedGuess}</h2>
      <p>${lives}</p>
      <div>
        <mwc-textfield
          label="Guess a character"
          maxLength="1"
          pattern="[a-zA-Z]+"
          validationMessage="Alphabets only!"
          autoValidate
          value="${this.curInput}"
          @input="${this.updateInput}"
          @keyup="${this.handleKeyUp}"
        ></mwc-textfield>
        <mwc-fab icon="send" @click="${this.submitGuess}">Guess!</mwc-fab>
      </div>
    `;
  }
}
