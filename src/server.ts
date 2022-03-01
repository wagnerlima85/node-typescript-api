import { Server } from '@overnightjs/core';
import bodyParser from 'body-parser';
import { Application } from 'express';
import { ForecastController } from './controllers/forecast';
import './util/module-alias';

export class SetupServer extends Server {
  constructor(private port = 3000) {
    super();
  }

  public init() {
    this.setupExpress();
    this.setupController();
  }

  private setupExpress() {
    this.app.use(bodyParser.json());
  }

  private setupController() {
    const forecastController = new ForecastController();
    this.addControllers([forecastController]);
  }

  public getApp(): Application {
    return this.app;
  }
}
