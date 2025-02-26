from django.db import models

class Result(models.Model):
    bot_move = models.CharField(max_length=50)
    user_move = models.CharField(max_length=50)
    status = models.CharField(max_length=50)

    def __str__(self):
        return f'Status: {self.status} | Bot: {self.bot_move} | User: {self.user_move}'

