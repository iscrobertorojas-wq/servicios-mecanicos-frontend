import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { LucideAngularModule, TrendingUp, DollarSign, Calendar, Package } from 'lucide-angular';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartData, ChartType, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, BaseChartDirective],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  stats: any = {
    weekTotal: 0,
    monthTotal: 0,
    yearTotal: 0,
    totalTotal: 0
  };

  readonly icons = {
    TrendingUp,
    DollarSign,
    Calendar,
    Package
  };

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {},
      y: { min: 0 }
    },
    plugins: {
      legend: { display: true },
    }
  };
  
  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    datasets: [
      { 
        data: Array(12).fill(0), 
        label: 'Ventas por Mes',
        backgroundColor: '#0ea5e9',
        borderRadius: 8
      }
    ]
  };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats() {
    this.api.getStats().subscribe({
      next: (res) => {
        this.stats = res;
        // Creamos una nueva referencia del objeto para que la gráfica detecte el cambio
        this.barChartData = {
          ...this.barChartData,
          datasets: [
            { 
              ...this.barChartData.datasets[0],
              data: res.monthlyChart.map((d: any) => d.total)
            }
          ]
        };
      },
      error: (err) => console.error(err)
    });
  }
}
