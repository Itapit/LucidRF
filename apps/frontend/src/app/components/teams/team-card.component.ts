import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { TeamDto, TeamType } from '@LucidRF/common';

@Component({
  selector: 'app-team-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './team-card.component.html',
})
export class TeamCardComponent {
  @Input({ required: true }) team!: TeamDto;
  @Output() teamClick = new EventEmitter<string>();

  TeamType = TeamType;
}
