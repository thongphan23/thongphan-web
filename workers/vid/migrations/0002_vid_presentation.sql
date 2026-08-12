ALTER TABLE vid_videos ADD COLUMN thumbnail_focal_x INTEGER NOT NULL DEFAULT 50 CHECK (thumbnail_focal_x BETWEEN 0 AND 100) CHECK (typeof(thumbnail_focal_x) = 'integer');
ALTER TABLE vid_videos ADD COLUMN thumbnail_focal_y INTEGER NOT NULL DEFAULT 24 CHECK (thumbnail_focal_y BETWEEN 0 AND 100) CHECK (typeof(thumbnail_focal_y) = 'integer');
