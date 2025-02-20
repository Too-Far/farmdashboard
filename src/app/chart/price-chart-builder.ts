import {OhlcDto} from '../models/ohlc-dto';
import {ElementRef} from '@angular/core';
import {createChart, IChartApi} from 'lightweight-charts';
import {NGXLogger} from 'ngx-logger';
import {LightweightChartsOptions} from './lightweight-charts-options';
import {ViewTypeService} from '../services/view-type.service';
import {ChartsOptionsLight} from './charts-options-light';

export class PriceChartBuilder {
  lastDate = 0;
  lastUpdatedPrice = 0.0;
  lastOhlc: OhlcDto;
  candleTime = 60 * 60; // sec
  chart: IChartApi;
  series;
  coin;

  constructor(private log: NGXLogger, coin: string, chartEl: ElementRef, public vt: ViewTypeService) {
    this.coin = coin;
    this.chart = createChart(chartEl.nativeElement, LightweightChartsOptions.getOptions());
    this.chart.applyOptions(ChartsOptionsLight.getOptions(this.vt.getThemeColor()));
  }

  public collectLastTx(price: number, blockDate: number): void {
    if (!this.lastDate) {
      this.log.debug('First data price not collected');
      return;
    }
    if (price !== this.lastUpdatedPrice) {
      this.lastUpdatedPrice = price;
    } else {
      return;
    }

    const dto = new OhlcDto();
    if (blockDate - this.lastOhlc.timestamp > this.candleTime) { // new candle
      dto.timestamp = Math.round(blockDate / this.candleTime) * this.candleTime;
      dto.open = price;
      dto.high = price;
      dto.low = price;
      dto.close = price;
    } else {
      dto.timestamp = this.lastOhlc.timestamp;
      dto.open = this.lastOhlc.open;
      if (price > this.lastOhlc.high) {
        dto.high = price;
      } else {
        dto.high = this.lastOhlc.high;
      }
      if (price < this.lastOhlc.low) {
        dto.low = price;
      } else {
        dto.low = this.lastOhlc.low;
      }
      dto.close = price;
    }
    const dtos: OhlcDto[] = [dto];
    this.addValuesToChart(dtos, true);
  }

  public addValuesToChart(dtos: OhlcDto[], update: boolean): void {
    if (!this.chart) {
      this.log.error('Chart not yet init');
    }
    const data = [];
    dtos?.forEach(dto => {
      if (dto.timestamp > this.lastDate) {
        this.lastDate = dto.timestamp;
      }
      this.lastOhlc = dto;
      data.push({time: dto.timestamp, open: dto.open, high: dto.high, low: dto.low, close: dto.close});
    });
    if (!this.series) {
      this.series = this.chart.addCandlestickSeries();
    }
    if (update) {
      const tick = data[0];
      this.series.update(tick);
    } else {
      this.series.setData(data);
    }

  }
}
