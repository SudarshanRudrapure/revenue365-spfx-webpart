/* eslint-disable require-atomic-updates */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { sp } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/fields';

export const LIST_NAME = 'Revenue 365';

// Lock — prevents double execution in React StrictMode dev
let isSettingUp = false;
let setupDone   = false;

// ── CHECK LIST EXISTS ─────────────────────────────────
const checkListExists = async (): Promise<boolean> => {
  try {
    await sp.web.lists.getByTitle(LIST_NAME)();
    return true;
  } catch {
    return false;
  }
};

// ── CHECK COLUMNS EXIST ───────────────────────────────
const checkColumnsExist = async (): Promise<boolean> => {
  try {
    const fields = await sp.web.lists
      .getByTitle(LIST_NAME)
      .fields
      .filter(`InternalName eq 'Types'`)
      .select('InternalName')
      ();
    const ok = fields.length > 0;
    console.log(ok ? '✅ Columns exist' : '❌ Columns missing');
    return ok;
  } catch {
    return false;
  }
};

// ── DELETE LIST ───────────────────────────────────────
const deleteList = async (): Promise<void> => {
  try {
    await sp.web.lists.getByTitle(LIST_NAME).delete();
    console.log('🗑️ Old list deleted');
    await new Promise(resolve => setTimeout(resolve, 3000));
  } catch (err) {
    console.error('Could not delete list:', err);
  }
};

// ── CREATE LIST ───────────────────────────────────────
const createList = async (): Promise<void> => {
  await sp.web.lists.add(LIST_NAME, 'Revenue 365 Catalog', 100);
  console.log(`✅ List "${LIST_NAME}" created`);
  await new Promise(resolve => setTimeout(resolve, 2000));
};

// ── FIELD HELPERS ─────────────────────────────────────
const safeAddTextField = async (list: any, name: string): Promise<void> => {
  try {
    const result = await list.fields.addText(name, 255);
    await result.field.update({ Required: false });
    console.log(`  ✅ ${name}`);
  } catch (e: any) {
    console.warn(`  ⚠️ skip ${name}:`, e?.message);
  }
};

const safeAddNumberField = async (list: any, name: string): Promise<void> => {
  try {
    const result = await list.fields.addNumber(name);
    await result.field.update({ Required: false });
    console.log(`  ✅ ${name}`);
  } catch (e: any) {
    console.warn(`  ⚠️ skip ${name}:`, e?.message);
  }
};

const safeAddCurrencyField = async (list: any, name: string): Promise<void> => {
  try {
    const result = await list.fields.addCurrency(name);
    await result.field.update({ Required: false });
    console.log(`  ✅ ${name}`);
  } catch (e: any) {
    console.warn(`  ⚠️ skip ${name}:`, e?.message);
  }
};

const safeAddMultiLineField = async (list: any, name: string): Promise<void> => {
  try {
    const result = await list.fields.addMultilineText(name);
    await result.field.update({ Required: false });
    console.log(`  ✅ ${name}`);
  } catch (e: any) {
    console.warn(`  ⚠️ skip ${name}:`, e?.message);
  }
};

const safeAddChoiceField = async (list: any, name: string, choices: string[]): Promise<void> => {
  try {
    const result = await list.fields.addChoice(name, choices);
    await result.field.update({ Required: false });
    console.log(`  ✅ ${name}`);
  } catch (e: any) {
    console.warn(`  ⚠️ skip ${name}:`, e?.message);
  }
};

// ── ADD ALL COLUMNS ───────────────────────────────────
const addAllColumns = async (): Promise<void> => {
  const list = sp.web.lists.getByTitle(LIST_NAME);
  console.log('📦 Adding columns...');

  await safeAddTextField(list, 'ProductID');
  await new Promise(resolve=> setTimeout(resolve, 500));

  await safeAddTextField(list, 'ServiceID');
  await new Promise(resolve => setTimeout(resolve, 500));

  await safeAddTextField(list, 'SubscriptionID');
  await new Promise(resolve => setTimeout(resolve, 500));

  await safeAddTextField(list, 'BundlesID');
  await new Promise(resolve => setTimeout(resolve, 500));

  await safeAddTextField(list, 'HSN_SAC');
  await new Promise(resolve => setTimeout(resolve, 500));

  await safeAddNumberField(list, 'NoofUsers');
  await new Promise(resolve => setTimeout(resolve, 500));

  await safeAddCurrencyField(list, 'Price');
  await new Promise(resolve => setTimeout(resolve, 500));

  await safeAddMultiLineField(list, 'Description');
  await new Promise(resolve => setTimeout(resolve, 500));

  await safeAddMultiLineField(list, 'Items');
  await new Promise(resolve => setTimeout(resolve, 500));

  await safeAddChoiceField(list, 'Category', ['HR365', 'APPS365', 'CIVIC365']);
  await new Promise(resolve => setTimeout(resolve, 500));

  await safeAddChoiceField(list, 'Interval', ['Monthly', 'Quarterly', 'Half Yearly', 'Yearly']);
  await new Promise(resolve => setTimeout(resolve, 500));

  await safeAddChoiceField(list, 'Types', ['Product', 'Service', 'Subscription', 'Bundle']);
  await new Promise(resolve => setTimeout(resolve, 500));

  await safeAddChoiceField(list, 'Status', ['Active', 'Inactive']);
  await new Promise(resolve => setTimeout(resolve, 500));

  console.log('✅ All columns added');
};

// ── MAIN SETUP ────────────────────────────────────────
export const setupList = async (): Promise<string> => {
  if (setupDone) {
    console.log('⚡ Setup already done this session');
    return 'exists';
  }

  if (isSettingUp) {
    console.log('⏳ Setup already in progress, waiting...');
    await new Promise(resolve => setTimeout(resolve, 8000));
    return 'exists';
  }

  isSettingUp = true;

  try {
    console.log('🔍 Checking list...');
    const exists = await checkListExists();

    if (exists) {
      console.log('📋 List found — verifying columns...');
      const columnsOk = await checkColumnsExist();

      if (columnsOk) {
        console.log('✅ List and columns OK!');
        setupDone   = true;
        isSettingUp = false;
        return 'exists';
      }

      console.log('⚠️ Columns missing — recreating list...');
      await deleteList();
    }

    console.log('🛠️ Creating list...');
    await createList();

    console.log('📦 Adding all columns...');
    await addAllColumns();

    const ok = await checkColumnsExist();
    if (!ok) throw new Error('Columns still missing after setup!');

    console.log('🎉 Setup complete!');
    setupDone   = true;
    isSettingUp = false;
    return 'created';

  } catch (error: any) {
    console.error('❌ setupList error:', error?.message || error);
    isSettingUp = false;
    return 'error';
  }
};