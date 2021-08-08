/* eslint-disable @typescript-eslint/no-unused-expressions */
import * as _ from 'lodash';
import { isFunction } from '../utils/util';

interface Event {
  name: string;
  isOnce: boolean;
  run: (timestamp?: number) => any;
}

class AnimationFrame {
  private static instance: AnimationFrame | null = null;

  // eslint-disable-next-line @typescript-eslint/ban-types
  private events: Event[] = [];

  private animationId: number | null = null;

  private constructor() {
    this.run = this.run.bind(this);

    this.animationId = window.requestAnimationFrame(this.run);
  }

  private run(timestamp: number) {
    this.events.forEach((event) => {
      event.run(timestamp);
    });
    this.animationId = window.requestAnimationFrame(this.run);
  }

  public static getInstance(): AnimationFrame {
    if (AnimationFrame.instance === null) {
      AnimationFrame.instance = new AnimationFrame();
    }
    return AnimationFrame.instance;
  }

  public setEvent(obj: any, name: string) {
    if (isFunction(obj)) {
      this.deleteEvent(name);
      this.events.push({
        name,
        isOnce: false,
        run: obj,
      });
    }
  }

  public deleteEvent(name: string) {
    _.remove(this.events, (i: Event) => i.name === name);
  }
}

export default AnimationFrame;
