import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChartConfiguration, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import { getFormattedNumber } from 'src/app/utils/formatted-number';

interface availableGraph {
  type: 'bar' | 'pie';
  typeChart: 'bar' | 'pie' | 'line' | 'doughnut' | 'radar' | 'polarArea'
}

@Component({
  selector: 'sic-chart-dialog',
  templateUrl: './chart-dialog.component.html',
  styleUrls: ['./chart-dialog.component.scss']
})
export class ChartDialogComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  availableGraphs: availableGraph[] = [];
  selectedTypeGraph: number = 0;
  graphSelect = 0;
  titleGraph = '';
  chartLabels: any[] = [];
  chartType: ChartType = 'pie';
  chartColors: string[] = [];
  totalElements: any[] = [];

  chartData!: ChartConfiguration['data'];
  chartOptions!: ChartConfiguration['options'];
  chartPlugins = [ DatalabelsPlugin ];

  constructor(@Inject(MAT_DIALOG_DATA) public dataGraph: any) {
    this.getGraphTypes();
    if (dataGraph.selectData.length > 0) {
      this.updateGraph();
    }
  }

  ngOnInit(): void {
  }

  updateGraph() {
    this.titleGraph = this.dataGraph[this.graphSelect].title;
    this.chartColors = this.dataGraph[this.graphSelect].chartColors[0].backgroundColor;
    this.totalElements = this.dataGraph[this.graphSelect].total;
    if (this.availableGraphs[this.selectedTypeGraph].type === 'bar') {
      this.chartType = this.availableGraphs[this.selectedTypeGraph].typeChart;
      this.chartData = {
        labels: [],
        datasets: [],
      };
      this.chartOptions = {
        responsive: true,
        aspectRatio: 7 / 3,
        elements: {
          line: {
            tension: 0.5
          }
        },
        scales: {
          x: {
          },
          y: {
          }
        },
        plugins: {
          legend: {
            display: true,
          },
          datalabels: {
            anchor: 'end',
            align: 'end',
            formatter: (value) => {
              return this.getFormattedNumber(value);
            }
          },
          tooltip: {
            callbacks: { 
              title: (tooltipItems) => {
                const tit = tooltipItems[0].label.split(':')[0];
                return tit.split('\\n');
              },
              label: (tooltipItem) => {
                const returnData: string[] = [];
                const value = tooltipItem.raw as number;
                const formattedValue = this.getFormattedNumber(value);
                returnData.push(`${tooltipItem.dataset.label}: ${formattedValue}`);
                return returnData;
              }
            }
          }
        }
      };

      if (this.availableGraphs[this.selectedTypeGraph].typeChart === 'radar') {
        this.chartOptions.scales = {
          x: {
            display: false
          },
          y: {
            display: false
          }
        };
        
      }

      this.chartData.labels = this.dataGraph[this.graphSelect].chartLabels;
      this.chartData.datasets = this.dataGraph[this.graphSelect].chartData;
      this.chartColors.map((color: string, i: number) => {
        this.chartData.datasets[i].borderColor = color;
        if (this.availableGraphs[this.selectedTypeGraph].typeChart === 'radar') {
          color = color + '66';  
        }
        this.chartData.datasets[i].backgroundColor = color;
        this.chartData.datasets[i].hoverBackgroundColor = color;
      });
    } else {
      this.chartLabels = [];
      this.chartType = this.availableGraphs[this.selectedTypeGraph].typeChart;
      this.chartData = {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [],
          hoverBackgroundColor: []
        }],
      };
      this.chartOptions = {
        responsive: true,
        aspectRatio: 7 / 3,
        plugins: {
          legend: {
            position: 'left'
          },
          datalabels: {
            display: false,
            formatter: (_value, ctx) => {
              if (ctx.chart.data.labels) {
                return ctx.chart.data.labels[ctx.dataIndex];
              }
            }
          },
          tooltip: {
            callbacks: { 
              title: (tooltipItems) => {
                const tit = tooltipItems[0].label.split(':')[0];
                return tit.split('\\n');
              },
              label: (tooltipItem) => {
                const returnData: string[] = [];
                const value = this.dataGraph[this.graphSelect].chartData[tooltipItem.dataIndex];
                const percentage = ((value * 100) / this.dataGraph[this.graphSelect].total[0].count).toFixed(2);
                const formattedValue = this.getFormattedNumber(value);
                returnData.push(`Total: ${percentage}% [${formattedValue}]`);
                if (this.dataGraph[this.graphSelect].extraData.length > 0) {
                  const extra = this.dataGraph[this.graphSelect].extraData[tooltipItem.dataIndex];
                  if (extra.name === tooltipItem.label.split(':')[0]) {
                    const index = this.dataGraph[this.graphSelect].total.findIndex((x) => x.type === extra.type);
                    const total = index >= 0 ? this.dataGraph[this.graphSelect].total[index].count : 0;
                    const extraPercentage = total > 0 ? ((extra.data * 100) / total).toFixed(2) : '';
                    const extraFormattedValue = this.getFormattedNumber(extra.data);
                    returnData.push(`${extra.type}: ${extraPercentage}% [${extraFormattedValue}]`);
                  }
                }
                return returnData;
              }
            }
          }
        }
      };

      for (let it = 0; it < this.dataGraph[this.graphSelect].chartLabels.length; it++) {
        const value = this.dataGraph[this.graphSelect].chartData[it];
        const percentage = ((value * 100) / this.dataGraph[this.graphSelect].total[0].count).toFixed(2);
        const formattedValue = this.getFormattedNumber(value);
        this.chartLabels.push(`${this.dataGraph[this.graphSelect].chartLabels[it]}: ${percentage}% [${formattedValue}]`);
      }
      this.chartData.labels = this.chartLabels;
      this.chartData.datasets = [{ 
        data: this.dataGraph[this.graphSelect].chartData, 
        backgroundColor: this.chartColors,
        hoverBackgroundColor: this.chartColors
      }];
    }
    this.chart?.render();
  }

  getFormattedNumber(numero: number) {
    return getFormattedNumber(numero);
  }

  getGraphTypes() {
    if (this.dataGraph.isGraphBar) {
      this.availableGraphs = [{
        type: 'bar',
        typeChart: 'bar'
      },
      {
        type: 'bar',
        typeChart: 'line'
      },
      {
        type: 'bar',
        typeChart: 'radar'
      }];
    } else {
      this.availableGraphs = [{
        type: 'pie',
        typeChart: 'pie'
      }, 
      {
        type: 'pie',
        typeChart: 'doughnut'
      },
      {
        type: 'pie',
        typeChart: 'polarArea'
      }];
    }
  }

  changeGraph() {
    this.selectedTypeGraph = (this.selectedTypeGraph + 1 >= this.availableGraphs.length) ? 0 : this.selectedTypeGraph + 1;
    this.updateGraph();
  }
}
