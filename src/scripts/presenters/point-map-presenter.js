import { fetchPoints } from '../models/story-model.js';

export class PointMapPresenter {
  constructor() {
    this.view = null;
  }

  setView(view) {
    this.view = view;
  }

  async onPageLoad() {
    try {
      this.view.render();
      const points = await fetchPoints();
      this.view.displayPoints(points);
    } catch (error) {
      this.view.renderError(error.message);
    }
  }
}