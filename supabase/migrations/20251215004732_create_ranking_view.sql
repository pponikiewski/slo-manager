-- Tworzymy widok, który łączy ministrantów z ich punktami
create or replace view member_scores as
select
  m.id,
  m.first_name,
  m.last_name,
  m.rank,
  m.guild,
  -- Tutaj dzieje się magia liczenia:
  coalesce(sum(
    case
      when al.type = 'O' then 1
      when al.type = 'N' then 0  -- Możesz tu dać np. -1
      when al.type = 'W' then 2
      when al.type = 'R' then 2
      when al.type = 'S' then 3
      else 0
    end
  ), 0) as total_points
from members m
left join attendance_logs al on m.id = al.member_id
group by m.id;