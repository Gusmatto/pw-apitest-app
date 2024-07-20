import { test, expect, request } from '@playwright/test';
import tags from '../test-data/tags.json'
import { TestContext } from 'node:test';

test.beforeEach(async({page}) => {
  await page.route('*/**/api/tags', async route => {
  await route.fulfill({
      body: JSON.stringify(tags)
    })
  })
  
  await page.goto('https://conduit.bondaracademy.com/');
})  

// test('has title', async ({ page }) => {
//  await page.route('*/**/api/articles*', async route => {
//    const response = await route.fetch();
//    const responseBody = await response.json();
//    responseBody.articles[0].title = 'This is a MOCK test title';
//    responseBody.articles[0].description = 'This is a MOCK test description';

//    await route.fulfill({
//      body: JSON.stringify(responseBody)
//    })
//  });

//  await page.getByText('Global Feed').click();
//  await expect(page.locator('.navbar-brand')).toHaveText('conduit');
//  await expect(page.locator('app-article-list h1').first()).toContainText('This is a MOCK test title');
//  await expect(page.locator('app-article-list p').first()).toContainText('This is a MOCK test description');
//}); 

test('Delete article', async({page, request}) => {
  
  const articleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles/', {
    data: {
      "article": {"body": "New article comment ", "description": "New article about", "tagList": [], "title": "New article title"}
    }
  })
  expect(articleResponse.status()).toEqual(201);
  
  await page.getByText('Global Feed').click();
  await page.getByText('New article title').click();
  await page.getByRole('button', {name: 'Delete Article'}).first().click();

  await expect(page.locator('app-article-list h1').first()).not.toContainText('New article title');
});

test('Create article', async({page, request}) => {
  await page.getByText('New Article').click();
  await page.getByPlaceholder('Article Title').fill('Playwright is Awesome!');
  await page.getByPlaceholder("What's this article about?").fill('About the Playwright boundeness');
  await page.getByPlaceholder('Write your article (in markdown)').fill('My awesome Playwright comment');
  await page.getByRole('button', {name: 'Publish Article'}).click();
  const articleResponse = await page.waitForResponse('https://conduit-api.bondaracademy.com/api/articles/');
  const articleResponseBody = await articleResponse.json();
  const slugId = articleResponseBody.article.slug

  await expect(page.locator('app-article-page h1')).toContainText('Playwright is Awesome!');
  const deleteArticleResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${slugId}`, {
  })

  expect(deleteArticleResponse.status()).toEqual(204);
});

test.afterEach(async ({ page }) => {
  await page.unrouteAll({ behavior: 'ignoreErrors' })
})


