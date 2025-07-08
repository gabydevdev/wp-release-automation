{
	"release": async function() {
		const version = require('./version');
		const build = require('./build');
		const zip = require('./zip');
		const git = require('../utils/git-operations');

		try {
			console.log('Starting release process...');
			
			await version(); // Bump version
			await build(); // Build the project
			await zip(); // Create zip file

			console.log('Pushing changes to Git...');
			await git.commitChanges('Release version: ' + process.env.VERSION);
			await git.pushChanges();

			console.log('Release process completed successfully!');
		} catch (error) {
			console.error('Error during release process:', error);
		}
	}
}