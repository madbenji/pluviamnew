-- Preview-only asset mapping for founder-approved ally cards.
-- The SVGs are bundled from the organizations' public official sites.
PRAGMA foreign_keys = ON;

UPDATE beta_ally_profiles SET logo_asset_path='/ally-isla-urbana.svg', logo_license_status='FOUNDER_APPROVED_PREVIEW', logo_alt='Logotipo oficial de Isla Urbana' WHERE ally_id='AL-BETA-ISLA';
UPDATE beta_ally_profiles SET logo_asset_path='/ally-raincolecta.svg', logo_license_status='FOUNDER_APPROVED_PREVIEW', logo_alt='Logotipo oficial de Rain Colecta' WHERE ally_id='AL-BETA-FERNANDO';
UPDATE beta_ally_profiles SET logo_asset_path='/ally-345-ingenieria.svg', logo_license_status='FOUNDER_APPROVED_PREVIEW', logo_alt='Logotipo oficial de 345 Ingeniería' WHERE ally_id='AL-BETA-345';
