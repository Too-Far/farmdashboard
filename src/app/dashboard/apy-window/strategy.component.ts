import {Component, Input, OnInit} from '@angular/core';
import {NGXLogger} from 'ngx-logger';
import {HardworkDataService} from '../../services/data/hardwork-data.service';
import {HarvestDataService} from '../../services/data/harvest-data.service';
import {HardWorkDto} from '../../models/hardwork-dto';
import {HarvestDto} from '../../models/harvest-dto';
import {Utils} from '../../static/utils';
import {Contract} from '../../models/contract';

@Component({
  selector: 'app-strategy',
  templateUrl: './strategy.component.html',
  styleUrls: ['./strategy.component.scss']
})
export class StrategyComponent implements OnInit {
  @Input() contract: Contract;

  constructor(private hardworkData: HardworkDataService,
              private harvestData: HarvestDataService,
              private log: NGXLogger) {
  }

  ngOnInit(): void {
  }

  hardwork(): HardWorkDto {
    return this.hardworkData.getLastHardWork(this.contract.address, this.contract.network);
  }

  harvest(): HarvestDto {
    return this.harvestData.getVaultLastInfo(this.contract.address, this.contract.network);
  }

  // ---------------- GETTERS --------------------

  toApy(n: number): number {
    return Utils.aprToApyEveryDayReinvest(n);
  }

  get vaultEarned(): number {
    return this.hardwork()?.fullRewardUsdTotal * (1 - this.hardwork()?.profitSharingRate);
  }

  get vaultEarnedLastWeek(): number {
    return this.hardwork()?.weeklyProfit * (1 - this.hardwork()?.profitSharingRate);
  }

  get vaultPeriodOfWork(): number {
    return this.hardwork()?.periodOfWork
        / (60 * 60 * 24);
  }

  get vaultApr(): number {
    return Math.max(this.hardworkData.getWeeklyApr(this.contract.address, this.contract.network), 0);
  }

}
