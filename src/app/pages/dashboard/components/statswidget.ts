import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { catchError, delay, finalize, map } from 'rxjs/operators';
import { IGeneralResponse } from '@/pages/auth/login';
import { of } from 'rxjs';
import { Skeleton } from 'primeng/skeleton';

@Component({
  standalone: true,
  selector: 'app-stats-widget',
  imports: [CommonModule, Skeleton],
  template: ` @if (loading()) {
      @for (item of [1, 2, 3]; track item) {
          <p-skeleton class="col-span-14 lg:col-span-6 xl:col-span-3" width="100%" height="142px" borderRadius="8px"></p-skeleton>
      }
  } @else {
      <div class="col-span-14 lg:col-span-6 xl:col-span-3">
          <div class="card mb-0">
              <div class="flex justify-between mb-4">
                  <div>
                      <span class="block text-muted-color font-medium mb-4">Active Clubs</span>
                      <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ static?.active_clubs }}
                      </div>
                  </div>
                  <div
                      class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border"
                      style="width: 2.5rem; height: 2.5rem"
                  >
                      <i class="pi pi-user text-blue-500 text-xl!"></i>
                  </div>
              </div>
              <span class="text-primary font-medium">24 new </span>
              <span class="text-muted-color">since last visit</span>
          </div>
      </div>
      <div class="col-span-12 lg:col-span-6 xl:col-span-3">
          <div class="card mb-0">
              <div class="flex justify-between mb-4">
                  <div>
                      <span class="block text-muted-color font-medium mb-4">Total Members</span>
                      <div
                          class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ static?.total_members }}
                      </div>
                  </div>
                  <div
                      class="flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-border"
                      style="width: 2.5rem; height: 2.5rem"
                  >
                      <i class="pi pi-chart-line text-orange-500 text-xl!"></i>
                  </div>
              </div>
              <span class="text-primary font-medium">%52+ </span>
              <span class="text-muted-color">since last week</span>
          </div>
      </div>
      <div class="col-span-12 lg:col-span-6 xl:col-span-3">
          <div class="card mb-0">
              <div class="flex justify-between mb-4">
                  <div>
                      <span class="block text-muted-color font-medium mb-4">Event this week</span>
                      <div
                          class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ static?.events_this_week }}
                      </div>
                  </div>
                  <div
                      class="flex items-center justify-center bg-cyan-100 dark:bg-cyan-400/10 rounded-border"
                      style="width: 2.5rem; height: 2.5rem"
                  >
                      <i class="pi pi-calendar text-cyan-500 text-xl!"></i>
                  </div>
              </div>
              <span class="text-primary font-medium">520 </span>
              <span class="text-muted-color">newly registered</span>
          </div>
      </div>
  }
  <!--        <div class="col-span-12 lg:col-span-6 xl:col-span-3">-->
  <!--            <div class="card mb-0">-->
  <!--                <div class="flex justify-between mb-4">-->
  <!--                    <div>-->
  <!--                        <span class="block text-muted-color font-medium mb-4">Comments</span>-->
  <!--                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">152 Unread</div>-->
  <!--                    </div>-->
  <!--                    <div class="flex items-center justify-center bg-purple-100 dark:bg-purple-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">-->
  <!--                        <i class="pi pi-comment text-purple-500 text-xl!"></i>-->
  <!--                    </div>-->
  <!--                </div>-->
  <!--                <span class="text-primary font-medium">85 </span>-->
  <!--                <span class="text-muted-color">responded</span>-->
  <!--            </div>-->
  <!--        </div>-->`,
})
export class StatsWidget implements OnInit {
  loading = signal(true);
  private httpClient = inject(HttpClient);
  static: PlatformStats | null = null;

  ngOnInit(): void {
    this.httpClient
      .get<IGeneralResponse<PlatformStats>>('http://localhost:8000/server/api/stats/platform')
      .pipe(
        delay(500),
        map(({ data }) => {
          if (!data) return null;
          return data;
        }),
        catchError(() => of(null)),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((resp) => {
          this.static = resp;
      });
  }
}

export interface PlatformStats {
    total_clubs: number;
    active_clubs: number;
    inactive_clubs: number;
    total_events: number;
    events_this_week: number;
    events_next_week: number;
    upcoming_events: number;
    past_events: number;
    total_members: number;
    current_week: string;
}
