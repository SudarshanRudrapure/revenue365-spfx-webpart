/* eslint-disable require-atomic-updates */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { sp } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import '@pnp/sp/attachments';

import { LIST_NAME } from './ListSetupService';

// Cache entity type name — fetched once from SharePoint
let entityTypeFullName: string | null = null;

const getEntityTypeName = async (): Promise<string> => {
  if (entityTypeFullName) return entityTypeFullName;
  try {
    const list = await sp.web.lists
      .getByTitle(LIST_NAME)
      .select('ListItemEntityTypeFullName')
      ();
    entityTypeFullName = list.ListItemEntityTypeFullName;
    console.log('📋 Entity type:', entityTypeFullName);
    return entityTypeFullName;
  } catch (error: any) {
    console.error('❌ Could not get entity type:', error?.message);
    return `SP.Data.${LIST_NAME.replace(/ /g, '_x0020_')}ListItem`;
  }
};

const cleanPayload = (data: Record<string, any>): Record<string, any> => {
  const clean: Record<string, any> = {};
  Object.keys(data).forEach(key => {
    const val = data[key];
    if (val !== undefined && val !== null && val !== '') {
      clean[key] = val;
    }
  });
  return clean;
};

// ── GET ITEMS ─────────────────────────────────────────
export const getItems = async (type: string, showInactive = false): Promise<any[]> => {
  try {
    const items = await sp.web.lists
      .getByTitle(LIST_NAME)
      .items
      .filter(`Types eq '${type}'`)
      .orderBy('Created', false)
      .select('*')
      ();

    if (showInactive) return items;
    return items.filter((item: any) => !item.Status || item.Status === 'Active');

  } catch (error: any) {
    console.error('❌ getItems error:', error?.message || error);
    return [];
  }
};

// ── SAVE ITEM ─────────────────────────────────────────
export const saveItem = async (itemData: Record<string, any>): Promise<number | null> => {
  try {
    const clean      = cleanPayload(itemData);
    const entityType = await getEntityTypeName();

    console.log('📤 Saving with type:', entityType);
    console.log('📤 Payload:', JSON.stringify(clean));

    const result = await sp.web.lists
      .getByTitle(LIST_NAME)
      .items
      .add({
        '__metadata': { 'type': entityType },
        ...clean,
      });

    console.log('✅ Saved! ID:', result.data.Id);
    return result.data.Id as number;

  } catch (error: any) {
    console.error('❌ saveItem FAILED:', error?.message);

    // Retry without __metadata
    if (error?.message?.includes('could not be resolved') ||
        error?.message?.includes('400')) {
      console.log('🔄 Retrying without __metadata...');
      entityTypeFullName = null;
      try {
        const clean  = cleanPayload(itemData);
        const result = await sp.web.lists
          .getByTitle(LIST_NAME)
          .items
          .add(clean);
        console.log('✅ Saved on retry! ID:', result.data.Id);
        return result.data.Id as number;
      } catch (retryError: any) {
        console.error('❌ Retry failed:', retryError?.message);
        return null;
      }
    }

    return null;
  }
};

// ── UPDATE ITEM ───────────────────────────────────────
export const updateItem = async (id: number, itemData: Record<string, any>): Promise<boolean> => {
  try {
    const clean      = cleanPayload(itemData);
    const entityType = await getEntityTypeName();

    console.log('📤 Updating ID:', id, JSON.stringify(clean));

    await sp.web.lists
      .getByTitle(LIST_NAME)
      .items
      .getById(id)
      .update({
        '__metadata': { 'type': entityType },
        ...clean,
      });

    console.log('✅ Updated!');
    return true;

  } catch (error: any) {
    console.error('❌ updateItem FAILED:', error?.message);

    // Retry without __metadata
    if (error?.message?.includes('could not be resolved') ||
        error?.message?.includes('400')) {
      console.log('🔄 Retrying update without __metadata...');
      entityTypeFullName = null;
      try {
        const clean = cleanPayload(itemData);
        await sp.web.lists
          .getByTitle(LIST_NAME)
          .items
          .getById(id)
          .update(clean);
        console.log('✅ Updated on retry!');
        return true;
      } catch (retryError: any) {
        console.error('❌ Retry update failed:', retryError?.message);
        return false;
      }
    }

    return false;
  }
};

// ── DELETE ITEM ───────────────────────────────────────
export const deleteItem = async (id: number): Promise<boolean> => {
  try {
    await sp.web.lists
      .getByTitle(LIST_NAME)
      .items
      .getById(id)
      .delete();

    console.log('✅ Deleted!');
    return true;

  } catch (error: any) {
    console.error('❌ deleteItem FAILED:', error?.message);
    return false;
  }
};

// ── ADD ATTACHMENT ────────────────────────────────────
export const addAttachment = async (itemId: number, file: File): Promise<boolean> => {
  try {
    const buffer = await file.arrayBuffer();
    await sp.web.lists
      .getByTitle(LIST_NAME)
      .items
      .getById(itemId)
      .attachmentFiles
      .add(file.name, buffer);

    console.log('✅ Attachment added!');
    return true;

  } catch (error: any) {
    console.error('❌ addAttachment FAILED:', error?.message);
    return false;
  }
};

// ── GET ATTACHMENTS ───────────────────────────────────
export const getAttachments = async (itemId: number): Promise<any[]> => {
  try {
    const attachments = await sp.web.lists
      .getByTitle(LIST_NAME)
      .items
      .getById(itemId)
      .attachmentFiles
      ();
    return attachments;

  } catch (error: any) {
    console.error('❌ getAttachments error:', error?.message);
    return [];
  }
};