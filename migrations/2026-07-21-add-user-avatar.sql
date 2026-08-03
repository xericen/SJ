-- Persist the selected avatar per authenticated user.
-- Applied to the current project database on 2026-07-21.
ALTER TABLE `user`
    ADD COLUMN IF NOT EXISTS `avatar` TEXT NULL AFTER `mobile`;
