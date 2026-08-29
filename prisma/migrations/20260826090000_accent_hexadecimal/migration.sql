-- Accent columns move from a tone key to a picked hexadecimal colour.
-- Rows already holding a colour, or holding nothing, are left untouched.

UPDATE "youtubers"
SET "accent" = CASE "accent"
    WHEN 'brand' THEN '#7c6222'
    WHEN 'success' THEN '#12784e'
    WHEN 'caution' THEN '#8a6a00'
    WHEN 'warning' THEN '#8a5300'
    WHEN 'danger' THEN '#be2436'
    WHEN 'info' THEN '#2a56be'
    WHEN 'neutral' THEN '#6b5f76'
  END
WHERE "accent" IN ('brand', 'success', 'caution', 'warning', 'danger', 'info', 'neutral');

UPDATE "job_functions"
SET "accent" = CASE "accent"
    WHEN 'brand' THEN '#7c6222'
    WHEN 'success' THEN '#12784e'
    WHEN 'caution' THEN '#8a6a00'
    WHEN 'warning' THEN '#8a5300'
    WHEN 'danger' THEN '#be2436'
    WHEN 'info' THEN '#2a56be'
    WHEN 'neutral' THEN '#6b5f76'
  END
WHERE "accent" IN ('brand', 'success', 'caution', 'warning', 'danger', 'info', 'neutral');

UPDATE "platforms"
SET "accent" = CASE "accent"
    WHEN 'brand' THEN '#7c6222'
    WHEN 'success' THEN '#12784e'
    WHEN 'caution' THEN '#8a6a00'
    WHEN 'warning' THEN '#8a5300'
    WHEN 'danger' THEN '#be2436'
    WHEN 'info' THEN '#2a56be'
    WHEN 'neutral' THEN '#6b5f76'
  END
WHERE "accent" IN ('brand', 'success', 'caution', 'warning', 'danger', 'info', 'neutral');

UPDATE "workflow_states"
SET "accent" = CASE "accent"
    WHEN 'brand' THEN '#7c6222'
    WHEN 'success' THEN '#12784e'
    WHEN 'caution' THEN '#8a6a00'
    WHEN 'warning' THEN '#8a5300'
    WHEN 'danger' THEN '#be2436'
    WHEN 'info' THEN '#2a56be'
    WHEN 'neutral' THEN '#6b5f76'
  END
WHERE "accent" IN ('brand', 'success', 'caution', 'warning', 'danger', 'info', 'neutral');

UPDATE "priorities"
SET "accent" = CASE "accent"
    WHEN 'brand' THEN '#7c6222'
    WHEN 'success' THEN '#12784e'
    WHEN 'caution' THEN '#8a6a00'
    WHEN 'warning' THEN '#8a5300'
    WHEN 'danger' THEN '#be2436'
    WHEN 'info' THEN '#2a56be'
    WHEN 'neutral' THEN '#6b5f76'
  END
WHERE "accent" IN ('brand', 'success', 'caution', 'warning', 'danger', 'info', 'neutral');

UPDATE "social_links"
SET "accent" = CASE "accent"
    WHEN 'brand' THEN '#7c6222'
    WHEN 'success' THEN '#12784e'
    WHEN 'caution' THEN '#8a6a00'
    WHEN 'warning' THEN '#8a5300'
    WHEN 'danger' THEN '#be2436'
    WHEN 'info' THEN '#2a56be'
    WHEN 'neutral' THEN '#6b5f76'
  END
WHERE "accent" IN ('brand', 'success', 'caution', 'warning', 'danger', 'info', 'neutral');

UPDATE "dispositifs"
SET "accent" = CASE "accent"
    WHEN 'brand' THEN '#7c6222'
    WHEN 'success' THEN '#12784e'
    WHEN 'caution' THEN '#8a6a00'
    WHEN 'warning' THEN '#8a5300'
    WHEN 'danger' THEN '#be2436'
    WHEN 'info' THEN '#2a56be'
    WHEN 'neutral' THEN '#6b5f76'
  END
WHERE "accent" IN ('brand', 'success', 'caution', 'warning', 'danger', 'info', 'neutral');

UPDATE "skill_categories"
SET "accent" = CASE "accent"
    WHEN 'brand' THEN '#7c6222'
    WHEN 'success' THEN '#12784e'
    WHEN 'caution' THEN '#8a6a00'
    WHEN 'warning' THEN '#8a5300'
    WHEN 'danger' THEN '#be2436'
    WHEN 'info' THEN '#2a56be'
    WHEN 'neutral' THEN '#6b5f76'
  END
WHERE "accent" IN ('brand', 'success', 'caution', 'warning', 'danger', 'info', 'neutral');

UPDATE "event_types"
SET "accent" = CASE "accent"
    WHEN 'brand' THEN '#7c6222'
    WHEN 'success' THEN '#12784e'
    WHEN 'caution' THEN '#8a6a00'
    WHEN 'warning' THEN '#8a5300'
    WHEN 'danger' THEN '#be2436'
    WHEN 'info' THEN '#2a56be'
    WHEN 'neutral' THEN '#6b5f76'
  END
WHERE "accent" IN ('brand', 'success', 'caution', 'warning', 'danger', 'info', 'neutral');

UPDATE "livecon_levels"
SET "accent" = CASE "accent"
    WHEN 'brand' THEN '#7c6222'
    WHEN 'success' THEN '#12784e'
    WHEN 'caution' THEN '#8a6a00'
    WHEN 'warning' THEN '#8a5300'
    WHEN 'danger' THEN '#be2436'
    WHEN 'info' THEN '#2a56be'
    WHEN 'neutral' THEN '#6b5f76'
  END
WHERE "accent" IN ('brand', 'success', 'caution', 'warning', 'danger', 'info', 'neutral');

UPDATE "sanction_measures"
SET "accent" = CASE "accent"
    WHEN 'brand' THEN '#7c6222'
    WHEN 'success' THEN '#12784e'
    WHEN 'caution' THEN '#8a6a00'
    WHEN 'warning' THEN '#8a5300'
    WHEN 'danger' THEN '#be2436'
    WHEN 'info' THEN '#2a56be'
    WHEN 'neutral' THEN '#6b5f76'
  END
WHERE "accent" IN ('brand', 'success', 'caution', 'warning', 'danger', 'info', 'neutral');

UPDATE "sanction_offenses"
SET "accent" = CASE "accent"
    WHEN 'brand' THEN '#7c6222'
    WHEN 'success' THEN '#12784e'
    WHEN 'caution' THEN '#8a6a00'
    WHEN 'warning' THEN '#8a5300'
    WHEN 'danger' THEN '#be2436'
    WHEN 'info' THEN '#2a56be'
    WHEN 'neutral' THEN '#6b5f76'
  END
WHERE "accent" IN ('brand', 'success', 'caution', 'warning', 'danger', 'info', 'neutral');
