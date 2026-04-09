import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TeamDto, TeamType } from '@LucidRF/common';

@Component({
  selector: 'ui-team-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './team-card.component.html',
})
export class TeamCardComponent {
  team = input.required<TeamDto>();
  teamClick = output<string>();

  TeamType = TeamType;
}
