import { test, expect } from '@playwright/test';
import { ADMIN, USER, loginViaApi, loc } from './helpers.js';
import { loginControls, feedControls, adminControls } from './catalog.js';

async function openCreatePost(page) {
  await page.locator('#share-image-button').click();
  await expect(page.locator('#title')).toBeInViewport();
}

async function runInteract(page, control) {
  const el = loc(page, control);
  if (control.setup === 'open-modal') {
    await openCreatePost(page);
  }
  const action = control.interact || { type: 'none' };
  if (action.type === 'fill') {
    await el.fill(action.value);
    await expect(el).toHaveValue(action.value);
    return;
  }
  if (action.type === 'trial-click') {
    await el.click({ trial: true });
    return;
  }
  if (action.type === 'select') {
    await el.selectOption(action.value);
    await expect(el).toHaveValue(action.value);
    return;
  }
  if (action.type === 'click-label') {
    // MDL pone el input encima del label; force dispara el click nativo for=.
    await el.click({ force: true });
    await expect(page.locator(action.focuses)).toBeFocused();
    return;
  }
  if (action.type === 'file') {
    await expect(el).toHaveAttribute('accept', /image/);
    return;
  }
  await expect(el).toBeAttached();
}

function registerControlTests(controls) {
  for (const control of controls) {
    test(`${control.id} · está en el DOM`, async ({ page }) => {
      await expect(loc(page, control)).toBeAttached();
    });

    test(`${control.id} · visibilidad`, async ({ page }) => {
      const el = loc(page, control);
      if (control.visible === false) {
        await expect(el).toBeHidden();
      } else if (control.visible === 'attached') {
        await expect(el).toBeAttached();
      } else {
        await expect(el).toBeVisible();
      }
    });

    test(`${control.id} · habilitación`, async ({ page }) => {
      const el = loc(page, control);
      if (control.enabled === false) {
        await expect(el).toBeDisabled();
      } else {
        await expect(el).toBeEnabled();
      }
    });

    test(`${control.id} · es ${control.tag}`, async ({ page }) => {
      await expect(loc(page, control)).toHaveJSProperty('tagName', control.tag);
    });

    test(`${control.id} · ${control.attr.name}=${control.attr.value}`, async ({ page }) => {
      const el = loc(page, control);
      if (control.attr.value instanceof RegExp) {
        await expect(el).toHaveAttribute(control.attr.name, control.attr.value);
      } else {
        await expect(el).toHaveAttribute(control.attr.name, control.attr.value);
      }
    });

    test(`${control.id} · foco`, async ({ page }) => {
      const el = loc(page, control);
      if (control.setup === 'open-modal') {
        await openCreatePost(page);
      }
      if (control.focusable) {
        await el.focus();
        await expect(el).toBeFocused();
      } else {
        expect(await el.evaluate((node) => node === document.activeElement)).toBeFalsy();
      }
    });

    test(`${control.id} · interacción`, async ({ page }) => {
      await runInteract(page, control);
    });

    test(`${control.id} · accesible`, async ({ page }) => {
      const el = loc(page, control);
      const acc = control.accessible;
      if (acc.type === 'text') {
        await expect(el).toHaveText(acc.value);
      } else if (acc.value instanceof RegExp) {
        await expect(el).toHaveAttribute(acc.name, acc.value);
      } else {
        await expect(el).toHaveAttribute(acc.name, acc.value);
      }
    });
  }
}

test.describe('Front · Login — controles', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('#login-form')).toBeVisible();
  });

  registerControlTests(loginControls);
});

test.describe('Front · Feed — controles', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaApi(page, USER);
    await page.goto('/');
    await expect(page.locator('#shared-moments .shared-moment-card').first()).toBeVisible();
    await expect(page.locator('#nav-username')).toContainText('user');
    await page.waitForSelector('.mdl-layout__drawer-button');
  });

  registerControlTests(feedControls);
});

test.describe('Front · Admin — controles', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaApi(page, ADMIN);
    await page.goto('/admin/users');
    await expect(page.locator('#users-table tbody tr').first()).toBeVisible();
    await expect(page.locator('#nav-username')).toContainText('admin');
    await page.waitForSelector('.mdl-layout__drawer-button');
  });

  registerControlTests(adminControls);
});
