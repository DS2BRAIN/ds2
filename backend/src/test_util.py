from unittest import TestCase
from .util import Util

class TestUtil(TestCase):

    def setUp(self) -> None:
        super().setUp()
        self.utilClass = Util()

    def test_getBotoClient(self):
        result = self.utilClass.getBotoClient('s3')
        self.assertEqual(result.meta.region_name, 'ap-northeast-2')

    def test_sendEmailAfterFinishingProject(self):
        result = self.utilClass.sendEmailAfterFinishingProject({'projectName': 'test', 'id': 1}, {'email': 'seungki.yeo@nectit.com'})
        self.assertEqual(result, {})

    def test_get_contents(self):
        result = self.utilClass.get_contents("1", "https://clickai.ai")
        self.assertIn('https://clickai.ai', result)

    def test_getEC2InstanceIDOrReturnDSLAB(self):
        result = self.utilClass.getEC2InstanceIDOrReturnDSLAB()
        self.assertEqual(result, 'dslab')

    def test_sendSlackMessage(self):
        result = self.utilClass.sendSlackMessage('unittest 중입니다.', unittest=True)
        self.assertEqual(result.text, 'ok')

    def test_getId(self):
        result = self.dbClass.getId(self.token)
        self.assertIsNotNone(result)